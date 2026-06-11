/* ============================================================
 *  Polishy — site interactions
 *  Vanilla JS for behaviour; GSAP only as progressive enhancement.
 *  Content is visible by default — nothing here is required to read
 *  the page. Respects prefers-reduced-motion.
 * ========================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------
   *  Mobile navigation toggle
   * ------------------------------------------------------- */
  function initNav() {
    const header = $("[data-header]");
    const toggle = $("[data-nav-toggle]");
    if (!header || !toggle) return;

    const setOpen = (open) => {
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "關閉主選單" : "開啟主選單");
    };

    toggle.addEventListener("click", () =>
      setOpen(!header.classList.contains("nav-open"))
    );

    // Close the menu after following an in-page link
    $$(".nav-menu a, .nav-menu .link-btn").forEach((link) =>
      link.addEventListener("click", () => setOpen(false))
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    /* Hide header when scrolling down, reveal when scrolling up */
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (!header.classList.contains("nav-open")) {
        if (y > 120 && y > lastY) header.classList.add("is-hidden");
        else header.classList.remove("is-hidden");
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    });
  }

  /* ---------------------------------------------------------
   *  Modals (about / learn-more)
   * ------------------------------------------------------- */
  function initModals() {
    let lastFocused = null;

    const open = (modal) => {
      if (!modal) return;
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const close = $("[data-modal-close]", modal);
      if (close) close.focus();
    };

    const close = (modal) => {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    $$("[data-modal-open]").forEach((btn) =>
      btn.addEventListener("click", () =>
        open(document.getElementById(btn.dataset.modalOpen))
      )
    );

    $$("[data-modal]").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close(modal);
      });
      const closeBtn = $("[data-modal-close]", modal);
      if (closeBtn) closeBtn.addEventListener("click", () => close(modal));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModal = $(".modal.is-open");
        if (openModal) close(openModal);
      }
    });
  }

  /* ---------------------------------------------------------
   *  日常舉例 — accordion cards
   * ------------------------------------------------------- */
  function initAccordion() {
    $$(".example-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
      });
    });
  }

  /* ---------------------------------------------------------
   *  Scroll reveal (no GSAP dependency)
   * ------------------------------------------------------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
   *  GSAP enhancements (optional, decorative only)
   * ------------------------------------------------------- */
  function initGsap() {
    if (prefersReducedMotion || typeof window.gsap === "undefined") return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // Floating bubbles
    $$("[data-bubbles] img").forEach((img, i) => {
      gsap.to(img, {
        y: i % 2 ? 36 : -44,
        x: i % 2 ? 24 : 18,
        scale: 1.08,
        duration: 5 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    // Hero portrait crossfade (me1 → me4)
    const figures = $$("[data-figure] img");
    if (figures.length > 1) {
      gsap.set(figures, { opacity: 0 });
      gsap.set(figures[0], { opacity: 1 });
      const tl = gsap.timeline({ repeat: -1 });
      figures.forEach((img, i) => {
        const next = figures[(i + 1) % figures.length];
        tl.to(img, { opacity: 0, duration: 0.8 }, "+=1.4").to(
          next,
          { opacity: 1, duration: 0.8 },
          "<"
        );
      });
    }

    // "你身邊也有這種人嗎" — staggered figure reveal on scroll
    if (window.ScrollTrigger) {
      const messy = $$("[data-messy] img");
      if (messy.length) {
        gsap.from(messy, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.15,
          scrollTrigger: { trigger: "[data-messy]", start: "top 80%" },
        });
      }

      // Fade the opening quotes as the reader scrolls past
      const quotes = $("[data-quotes]");
      if (quotes) {
        gsap.to(quotes, {
          opacity: 0,
          scrollTrigger: {
            trigger: quotes,
            start: "center center",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }
  }

  /* ---------------------------------------------------------
   *  Boot
   * ------------------------------------------------------- */
  function init() {
    initNav();
    initModals();
    initAccordion();
    initReveal();
    initGsap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
