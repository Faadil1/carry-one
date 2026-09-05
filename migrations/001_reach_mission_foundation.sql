BEGIN;

CREATE TYPE mission_status AS ENUM ('ACTIVE', 'ARRIVED', 'CANCELLED');
CREATE TYPE mission_visibility AS ENUM ('UNLISTED', 'PRIVATE', 'PUBLIC');
CREATE TYPE invitation_status AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN', 'COMPLETED');
CREATE TYPE hop_status AS ENUM ('PENDING', 'INCLUDED', 'FINAL', 'INVALID');
CREATE TYPE challenge_status AS ENUM ('ISSUED', 'USED', 'EXPIRED');

CREATE TABLE missions (
  id uuid PRIMARY KEY,
  creator_wallet_normalized text NOT NULL,
  creator_display_label text,
  current_holder_wallet_normalized text NOT NULL,
  target_label text NOT NULL CHECK (char_length(target_label) BETWEEN 1 AND 60),
  target_wallet_ciphertext bytea NOT NULL,
  target_wallet_hmac text NOT NULL,
  target_consent_confirmed boolean NOT NULL DEFAULT false,
  mission_note text NOT NULL CHECK (char_length(mission_note) BETWEEN 1 AND 180),
  status mission_status NOT NULL DEFAULT 'ACTIVE',
  visibility mission_visibility NOT NULL DEFAULT 'UNLISTED',
  finalized_hop_count integer NOT NULL DEFAULT 0 CHECK (finalized_hop_count >= 0),
  current_sequence integer NOT NULL DEFAULT 0 CHECK (current_sequence >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  arrived_at timestamptz,
  cancelled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (creator_wallet_normalized <> ''),
  CHECK (current_holder_wallet_normalized <> ''),
  CHECK (target_consent_confirmed = true),
  CHECK ((status = 'ARRIVED' AND arrived_at IS NOT NULL) OR status <> 'ARRIVED')
);

CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  sequence integer NOT NULL CHECK (sequence >= 1),
  inviter_wallet_normalized text NOT NULL,
  candidate_label text,
  candidate_wallet_normalized text,
  candidate_display_label text,
  why_you text CHECK (why_you IS NULL OR char_length(why_you) <= 120),
  invite_token_hash text NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'INVITED',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  pass_deadline_at timestamptz,
  declined_at timestamptz,
  withdrawn_at timestamptz,
  completed_at timestamptz,
  closed_at timestamptz,
  CHECK ((status = 'ACCEPTED' AND candidate_wallet_normalized IS NOT NULL AND accepted_at IS NOT NULL)
      OR status <> 'ACCEPTED')
);

CREATE UNIQUE INDEX one_open_invitation_per_mission
  ON invitations (mission_id)
  WHERE status IN ('INVITED', 'ACCEPTED');
CREATE UNIQUE INDEX one_invitation_sequence_per_mission ON invitations (mission_id, sequence);

CREATE TABLE pass_intents (
  mission_id uuid PRIMARY KEY REFERENCES missions(id) ON DELETE CASCADE,
  invitation_id uuid NOT NULL UNIQUE REFERENCES invitations(id),
  sequence integer NOT NULL CHECK (sequence >= 1),
  current_holder_wallet_normalized text NOT NULL,
  recipient_wallet_normalized text NOT NULL,
  nonce text NOT NULL UNIQUE,
  recipient_data text NOT NULL,
  tx_hash text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (current_holder_wallet_normalized <> recipient_wallet_normalized),
  CHECK (recipient_data LIKE 'co:v1:%'),
  CHECK (octet_length(recipient_data) <= 64)
);

CREATE TABLE hops (
  id uuid PRIMARY KEY,
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  invitation_id uuid NOT NULL REFERENCES invitations(id),
  sequence integer NOT NULL CHECK (sequence >= 1),
  sender_wallet_normalized text NOT NULL,
  recipient_wallet_normalized text NOT NULL,
  tx_hash text,
  recipient_value_luna bigint,
  status hop_status NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  included_at timestamptz,
  finalized_at timestamptz,
  invalidated_at timestamptz,
  invalid_reason text,
  CHECK (sender_wallet_normalized <> recipient_wallet_normalized),
  CHECK (recipient_value_luna IS NULL OR recipient_value_luna = 100000),
  CHECK ((status = 'FINAL' AND tx_hash IS NOT NULL AND finalized_at IS NOT NULL AND recipient_value_luna = 100000)
      OR status <> 'FINAL')
);

CREATE UNIQUE INDEX one_hop_sequence_per_mission ON hops (mission_id, sequence);
CREATE UNIQUE INDEX global_tx_hash_replay_guard ON hops (tx_hash) WHERE tx_hash IS NOT NULL;

CREATE TABLE participants (
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  wallet_normalized text NOT NULL,
  display_label text,
  display_name_opt_in boolean NOT NULL DEFAULT false,
  first_final_sequence integer,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mission_id, wallet_normalized)
);
-- The creator is inserted as the first participant at mission creation. The
-- primary key then becomes a database-level no-route-loop guard: a wallet may
-- not become a finalized participant twice in one mission.

CREATE TABLE auth_challenges (
  id uuid PRIMARY KEY,
  wallet_normalized text NOT NULL,
  action text NOT NULL,
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES invitations(id) ON DELETE CASCADE,
  sequence integer NOT NULL DEFAULT 0,
  nonce_hash text NOT NULL UNIQUE,
  canonical_message text NOT NULL,
  status challenge_status NOT NULL DEFAULT 'ISSUED',
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_challenge_lookup ON auth_challenges (wallet_normalized, action, status, expires_at);

CREATE TABLE audit_events (
  id bigserial PRIMARY KEY,
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES invitations(id) ON DELETE SET NULL,
  hop_id uuid REFERENCES hops(id) ON DELETE SET NULL,
  actor_wallet_normalized text,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
