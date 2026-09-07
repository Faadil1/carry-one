BEGIN;

-- Revalidate the canonical mission authority/sequence at INSERT time while
-- holding the mission row lock. This closes the race between an earlier
-- application-level read and a concurrent finalization/current-holder change.
CREATE OR REPLACE FUNCTION carry_one_guard_invitation_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  mission_row missions%ROWTYPE;
BEGIN
  SELECT * INTO mission_row
  FROM missions
  WHERE id = NEW.mission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'mission missing for invitation'
      USING ERRCODE = '23503';
  END IF;
  IF mission_row.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'mission must be ACTIVE for invitation insert'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.inviter_wallet_normalized <> mission_row.current_holder_wallet_normalized THEN
    RAISE EXCEPTION 'inviter is not current holder'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.sequence <> mission_row.current_sequence + 1 THEN
    RAISE EXCEPTION 'invitation sequence is not next canonical sequence'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.candidate_wallet_normalized IS NOT NULL AND EXISTS (
    SELECT 1 FROM participants p
    WHERE p.mission_id = NEW.mission_id
      AND p.wallet_normalized = NEW.candidate_wallet_normalized
  ) THEN
    RAISE EXCEPTION 'participants_pkey: route wallet reuse'
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS carry_one_invitation_insert_guard ON invitations;
CREATE TRIGGER carry_one_invitation_insert_guard
BEFORE INSERT ON invitations
FOR EACH ROW EXECUTE FUNCTION carry_one_guard_invitation_insert();

-- An unbound invite is wallet-bound when it transitions to ACCEPTED. Reject a
-- wallet already present in the canonical participant set at the DB boundary.
CREATE OR REPLACE FUNCTION carry_one_guard_invitation_accept()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'ACCEPTED'
     AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.candidate_wallet_normalized IS DISTINCT FROM NEW.candidate_wallet_normalized)
     AND NEW.candidate_wallet_normalized IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM participants p
       WHERE p.mission_id = NEW.mission_id
         AND p.wallet_normalized = NEW.candidate_wallet_normalized
     ) THEN
    RAISE EXCEPTION 'participants_pkey: route wallet reuse'
      USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS carry_one_invitation_accept_guard ON invitations;
CREATE TRIGGER carry_one_invitation_accept_guard
BEFORE UPDATE OF status, candidate_wallet_normalized ON invitations
FOR EACH ROW EXECUTE FUNCTION carry_one_guard_invitation_accept();

-- PgMissionRepository intentionally inserts every newly finalized recipient in
-- participants. Its historical ON CONFLICT path must never silently turn a
-- repeated participant into a valid route. No production code has a legitimate
-- UPDATE on participants in Cycle II, so any UPDATE is a route-reentry signal.
CREATE OR REPLACE FUNCTION carry_one_reject_participant_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'participants_pkey: route wallet reuse'
    USING ERRCODE = '23505';
END;
$$;

DROP TRIGGER IF EXISTS carry_one_participant_reentry_guard ON participants;
CREATE TRIGGER carry_one_participant_reentry_guard
BEFORE UPDATE ON participants
FOR EACH ROW EXECUTE FUNCTION carry_one_reject_participant_update();

COMMIT;
