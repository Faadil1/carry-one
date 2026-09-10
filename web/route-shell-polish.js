(() => {
  "use strict";

  const screen = document.querySelector("#screen");
  if (!screen) return;

  let scheduled = false;
  let lastPath = null;

  function cleanPath() {
    return location.pathname.replace(/\/+$/, "") || "/";
  }

  function polishCreateSurface(path) {
    if (path !== "/create") return;
    const card = screen.querySelector(".form-card");
    if (!card) return;

    const kicker = card.querySelector(".kicker");
    if (kicker) kicker.textContent = "STEP 1 OF 5 · CREATE MISSION";

    const lede = card.querySelector(".lede");
    if (lede) {
      lede.textContent = "Use a known, consenting Nimiq destination. The destination wallet stays private and is never shown in normal route views.";
    }

    const consent = card.querySelector(".checkline span");
    if (consent) {
      consent.textContent = "I confirm this target is known to me and has consented to be the destination for this mission.";
    }
  }

  function preserveBrandChrome(path) {
    if (path === lastPath) return;
    lastPath = path;
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }

  function apply() {
    scheduled = false;
    const path = cleanPath();
    polishCreateSurface(path);
    preserveBrandChrome(path);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  new MutationObserver(schedule).observe(screen, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  schedule();
})();
