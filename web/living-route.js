(() => {
  "use strict";

  const screen = document.querySelector("#screen");
  const notice = document.querySelector("#notice");
  if (!screen) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  let scheduled = false;
  let lastPath = "";

  function text(element) {
    return (element?.textContent || "").trim();
  }

  function routePhaseFromNotice() {
    const message = text(notice);
    if (!message) return "idle";
    if (/FINAL|custody (?:moved|advanced)|ARRIVED/i.test(message)) return "final";
    if (/waiting for independent FINAL|verification delayed|transaction claimed|reconcil/i.test(message)) return "verify";
    if (/approve exactly 1 NIM|open Nimiq Pay/i.test(message)) return "wallet";
    if (/authoriz(?:e|ing).*pass/i.test(message)) return "authorize";
    return "idle";
  }

  function enhanceFlow() {
    const flow = screen.querySelector(".wi-flow");
    if (!flow) return;
    flow.dataset.livingRoute = "1";
    const current = flow.querySelector(".wi-flow-step.current");
    flow.querySelectorAll(".wi-flow-step").forEach((step) => step.removeAttribute("aria-current"));
    current?.setAttribute("aria-current", "step");
  }

  function enhanceRouteSteps() {
    screen.querySelectorAll(".route-step").forEach((step, index) => {
      step.style.setProperty("--lr-index", String(index));
      step.dataset.finalized = "true";
    });
  }

  function enhanceEmptyRoute() {
    const empty = screen.querySelector(".empty-route");
    if (!empty || empty.dataset.livingRoute === "1") return;
    empty.dataset.livingRoute = "1";
    const copy = text(empty);
    const visual = document.createElement("div");
    visual.className = "lr-empty-route";
    visual.setAttribute("aria-hidden", "true");
    visual.innerHTML = '<span class="lr-empty-node"></span><span class="lr-empty-line"></span><span class="lr-empty-node"></span><span class="lr-empty-line"></span><span class="lr-empty-node"></span><span class="lr-empty-caption">The route advances only after independent FINAL verification.</span>';
    empty.textContent = copy;
    empty.before(visual);
  }

  function enhanceBridgeInvitation() {
    const hero = screen.querySelector(".hero-card");
    if (!hero || hero.dataset.livingBridgeAsk === "1") return;
    const title = hero.querySelector("h1");
    if (!/next bridge/i.test(text(title))) return;

    const target = text(hero.querySelector(".lede strong")) || "the destination";
    const ask = document.createElement("div");
    ask.className = "lr-bridge-ask";
    ask.innerHTML = `<strong>Someone on this route thinks you can move this closer to ${escapeHtml(target)}.</strong><span>You are being asked to become the next human bridge. Accepting is consent to receive the baton next; it does not move funds by itself.</span>`;
    const whyCard = hero.querySelector(".card");
    (whyCard || hero.querySelector(".warning") || hero.querySelector(".button-row"))?.before(ask);
    hero.dataset.livingBridgeAsk = "1";
  }

  function enhanceProofLadder() {
    const ladder = screen.querySelector(".wi-proof-ladder");
    if (!ladder) return;
    const phase = routePhaseFromNotice();
    const steps = [...ladder.querySelectorAll(".wi-proof-step")];
    steps.forEach((step) => step.classList.remove("lr-active", "lr-complete"));

    if (phase === "wallet") steps[0]?.classList.add("lr-active");
    if (phase === "verify") {
      steps[0]?.classList.add("lr-complete");
      steps[1]?.classList.add("lr-active");
    }
    if (phase === "final") {
      steps[0]?.classList.add("lr-complete");
      steps[1]?.classList.add("lr-complete");
      steps[2]?.classList.add("lr-active", "lr-complete");
    }

    let status = ladder.parentElement?.querySelector(".lr-proof-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "lr-proof-status";
      status.innerHTML = '<span class="lr-proof-status-dot"></span><span class="lr-proof-status-copy">Ready for wallet approval.</span>';
      ladder.after(status);
    }
    status.dataset.phase = phase;
    const statusCopy = status.querySelector(".lr-proof-status-copy");
    if (statusCopy) {
      statusCopy.textContent = phase === "wallet"
        ? "Wallet approval requested — custody has not moved."
        : phase === "verify"
          ? "Transaction seen — waiting for independent FINAL verification."
          : phase === "final"
            ? "FINAL — custody moved and the verified route advanced."
            : phase === "authorize"
              ? "Preparing a pass bound to this accepted bridge."
              : "Ready for wallet approval.";
    }
  }

  function syncBusyButtons() {
    const messageVisible = notice && !notice.hidden && Boolean(text(notice));
    screen.querySelectorAll("button[data-busy-lock='1']").forEach((button) => {
      const busy = messageVisible && button.disabled;
      if (busy) button.setAttribute("aria-busy", "true");
      else button.removeAttribute("aria-busy");
    });
  }

  function revealReceipt() {
    const receipt = screen.querySelector(".wi-receipt");
    if (!receipt || receipt.dataset.livingReveal === "1") return;
    receipt.dataset.livingReveal = "1";
    const key = `nimcarry.receiptSeen.${location.pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    if (!reducedMotion) {
      window.setTimeout(() => receipt.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
    }
  }

  function animateScreenEntry() {
    if (lastPath === location.pathname) return;
    lastPath = location.pathname;
    screen.classList.remove("lr-screen-enter");
    void screen.offsetWidth;
    screen.classList.add("lr-screen-enter");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function apply() {
    scheduled = false;
    animateScreenEntry();
    enhanceFlow();
    enhanceRouteSteps();
    enhanceEmptyRoute();
    enhanceBridgeInvitation();
    enhanceProofLadder();
    syncBusyButtons();
    revealReceipt();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  document.addEventListener("pointerdown", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".button") : null;
    if (button && !button.disabled) button.classList.add("lr-pressed");
  }, { passive: true });

  ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
    document.addEventListener(type, () => document.querySelectorAll(".button.lr-pressed").forEach((button) => button.classList.remove("lr-pressed")), { passive: true });
  });

  new MutationObserver(schedule).observe(screen, { childList: true, subtree: true });
  if (notice) new MutationObserver(schedule).observe(notice, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class"] });
  addEventListener("popstate", schedule);
  schedule();
})();
