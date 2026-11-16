/**
 * PAWVOYAGE MAIN JAVASCRIPT
 * Global interactions: theme, RTL, drawer, sticky header, scroll reveals,
 * form validation, plus the two interactive homepage modules
 * (Pet Tag Studio on index.html, Ride Fare Planner on home2.html).
 */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     1. Scroll Reveal
     Runs immediately (not on DOMContentLoaded) so nothing flashes in.
     ======================================================================== */
  function initReveals() {
    const items = document.querySelectorAll('.reveal:not([data-revealed])');
    if (!items.length) return;
    items.forEach((el) => el.setAttribute('data-revealed', ''));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach((el) => observer.observe(el));

    // Failsafe: never leave content permanently hidden.
    window.setTimeout(() => items.forEach((el) => el.classList.add('is-visible')), 2500);
  }

  initReveals();

  document.addEventListener('DOMContentLoaded', () => {
    initReveals(); // catch anything added after the first pass

    /* ======================================================================
       2. Theme Toggle (Light / Dark)
       ====================================================================== */
    const themeToggles = document.querySelectorAll('.theme-toggle');

    function updateThemeIcons(theme) {
      themeToggles.forEach((toggle) => {
        toggle.innerHTML = theme === 'dark' ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
      });
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeIcons('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      updateThemeIcons('light');
    }

    themeToggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
          updateThemeIcons('light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
          updateThemeIcons('dark');
        }
      });
    });

    /* ======================================================================
       3. RTL Toggle
       ====================================================================== */
    const rtlToggles = document.querySelectorAll('.rtl-toggle');
    const root = document.documentElement;

    /* Everything anchored to an edge - the closed drawer above all - jumps to
       the opposite side when dir flips. Left to transition, the off-screen
       drawer visibly sweeps across the viewport, which reads as the hamburger
       menu flashing open. Transitions are suppressed for the frame in which
       the flip lands, then restored. */
    function setDirection(rtl) {
      root.classList.add('dir-switching');

      if (rtl) {
        root.setAttribute('dir', 'rtl');
        localStorage.setItem('rtl-mode', 'true');
      } else {
        root.removeAttribute('dir');
        localStorage.setItem('rtl-mode', 'false');
      }

      // Force the new layout to be committed while transitions are still off.
      void root.offsetWidth;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => root.classList.remove('dir-switching'));
      });
    }

    if (localStorage.getItem('rtl-mode') === 'true') {
      setDirection(true);
    }

    rtlToggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        setDirection(root.getAttribute('dir') !== 'rtl');
      });
    });

    /* ======================================================================
       4. Mobile Drawer Navigation
       ====================================================================== */
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.querySelector('.mobile-drawer');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerOverlay = document.querySelector('.drawer-overlay');

    function openDrawer() {
      if (!drawer || !drawerOverlay) return;
      drawer.classList.add('open');
      drawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (!drawer || !drawerOverlay) return;
      drawer.classList.remove('open');
      drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    /* ======================================================================
       5. Sticky Header
       ====================================================================== */
    const header = document.querySelector('.header');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ======================================================================
       5b. Back to top
       Injected rather than repeated in every page's markup - it is chrome
       with no content of its own, and every page loads this file.
       ====================================================================== */
    const backToTop = document.createElement('button');
    backToTop.type = 'button';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.title = 'Back to top';
    backToTop.innerHTML = '<i class="ph ph-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(backToTop);

    const onBackToTopScroll = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    };
    onBackToTopScroll();
    window.addEventListener('scroll', onBackToTopScroll, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ======================================================================
       6. Count-up stats (hero proof numbers)
       ====================================================================== */
    const counters = document.querySelectorAll('[data-count-to]');
    if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            countObserver.unobserve(el);

            const target = parseFloat(el.dataset.countTo);
            const suffix = el.dataset.countSuffix || '';
            const decimals = (el.dataset.countTo.split('.')[1] || '').length;
            const duration = 1400;
            const start = performance.now();

            const step = (now) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              el.textContent = (target * eased).toFixed(decimals) + suffix;
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((el) => countObserver.observe(el));
    }

    /* ======================================================================
       7. Client-Side Form Validation (Global)
       ====================================================================== */
    document.querySelectorAll('form.needs-validation').forEach((form) => {
      form.addEventListener('submit', (e) => {
        let isValid = true;
        const inputs = form.querySelectorAll('.form-control[required], input[type="checkbox"][required]');

        inputs.forEach((input) => {
          if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
            isValid = false;
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
          } else if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
              isValid = false;
              input.classList.add('is-invalid');
              input.classList.remove('is-valid');
            } else {
              input.classList.remove('is-invalid');
              input.classList.add('is-valid');
            }
          } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
          }
        });

        const pass = form.querySelector('input[name="password"]');
        const confirmPass = form.querySelector('input[name="confirm_password"]');
        if (pass && confirmPass && pass.value !== confirmPass.value) {
          isValid = false;
          confirmPass.classList.add('is-invalid');
          const scope = confirmPass.closest('.field') || confirmPass.parentElement;
          const err = scope.querySelector('.error-message');
          if (err) err.textContent = 'Passwords do not match';
        }

        if (!isValid) e.preventDefault();
      });

      form.querySelectorAll('.form-control, input[type="checkbox"]').forEach((input) => {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid', 'is-valid');
        });
      });
    });

    /* ======================================================================
       7b. Password Reveal Toggles (auth pages)
       ====================================================================== */
    document.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
      const input = toggle.parentElement.querySelector('input');
      if (!input) return;

      toggle.addEventListener('click', () => {
        const shown = input.type === 'text';
        input.type = shown ? 'password' : 'text';
        toggle.innerHTML = shown ? '<i class="ph ph-eye"></i>' : '<i class="ph ph-eye-slash"></i>';
        toggle.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
        input.focus();
      });
    });

    /* ======================================================================
       8. Interactive Module: Live Dispatch & Cabin Telemetry Simulator (index.html)
       ====================================================================== */
    initDispatchSimulator();

    /* ======================================================================
       9. Interactive Module: Ride & Fare Planner (home2.html)
       ====================================================================== */
    initVisitPlanner();
  });

  /* ------------------------------------------------------------------------
     Live Dispatch & Cabin Telemetry Simulator
     ------------------------------------------------------------------------ */
  function initDispatchSimulator() {
    const root = document.querySelector('[data-dispatch-sim]');
    if (!root) return;

    const petBtns = root.querySelectorAll('[data-sim-pet]');
    const tripBtns = root.querySelectorAll('[data-sim-trip]');
    const addonBtns = root.querySelectorAll('[data-sim-addon]');

    const outVehicle = root.querySelector('[data-sim-vehicle]');
    const outTemp = root.querySelector('[data-sim-temp]');
    const outNoise = root.querySelector('[data-sim-noise]');
    const outEta = root.querySelector('[data-sim-eta]');
    const outPrice = root.querySelector('[data-sim-price]');
    const outNote = root.querySelector('[data-sim-note]');
    const protocolItems = root.querySelectorAll('[data-sim-protocol]');

    const state = {
      pet: 'dog-med',
      petLabel: 'Medium Dog',
      baseFare: 29,
      trip: 'vet',
      tripPrice: 12,
      eta: '14 mins',
      addons: new Set(['harness'])
    };

    function render() {
      const addonCost = state.addons.size * 5;
      const total = state.baseFare + state.tripPrice + addonCost;
      const isCat = state.pet === 'cat';
      const isSenior = state.pet === 'senior';

      if (outVehicle) {
        outVehicle.textContent = isCat
          ? 'Feline Quiet Cruiser #02'
          : isSenior
            ? 'Ortho-Ramp Sprinter #07'
            : 'Metro Pet Cruiser #04';
      }
      if (outTemp) outTemp.textContent = isCat ? '70°F Gentle' : '68°F Optimal';
      if (outNoise) outNoise.textContent = state.addons.has('acoustic') || isCat ? '34 dB Whisper' : '40 dB Calm';
      if (outEta) outEta.textContent = state.eta;
      if (outPrice) outPrice.textContent = '$' + total;

      protocolItems.forEach((el) => {
        const key = el.getAttribute('data-sim-protocol');
        const active =
          key === 'gps' ||
          key === 'hepa' ||
          state.addons.has(key) ||
          (key === 'ramp' && isSenior) ||
          (key === 'acoustic' && isCat);
        el.classList.toggle('is-on', active);
      });

      if (outNote) {
        if (isCat) {
          outNote.textContent = 'Separate sound-insulated feline cabin with Feliway diffuser and anchor-locked carrier.';
        } else if (isSenior) {
          outNote.textContent = 'Low-incline hydraulic boarding ramp and memory-foam orthopedic bed prepped for boarding.';
        } else {
          outNote.textContent = 'Crash-tested Sleepypod harness ready; chauffeur shares live GPS & arrival photo in your Dashboard.';
        }
      }
    }

    petBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        petBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        state.pet = btn.dataset.simPet;
        state.petLabel = btn.dataset.label || '';
        state.baseFare = Number(btn.dataset.price || 29);
        render();
      });
    });

    tripBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tripBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        state.trip = btn.dataset.simTrip;
        state.tripPrice = Number(btn.dataset.price || 0);
        state.eta = btn.dataset.eta || '15 mins';
        render();
      });
    });

    addonBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.simAddon;
        if (state.addons.has(key)) {
          state.addons.delete(key);
          btn.setAttribute('aria-pressed', 'false');
        } else {
          state.addons.add(key);
          btn.setAttribute('aria-pressed', 'true');
        }
        render();
      });
    });

    render();
  }

  /* ------------------------------------------------------------------------
     Visit Planner
     ------------------------------------------------------------------------ */
  function initVisitPlanner() {
    const root = document.querySelector('[data-planner]');
    if (!root) return;

    const ageBtns = root.querySelectorAll('[data-age]');
    const zoneBtns = root.querySelectorAll('[data-zone]');
    const lengthBtns = root.querySelectorAll('[data-length]');
    const extraBtns = root.querySelectorAll('[data-extra]');

    const outAge = root.querySelector('[data-out-age]');
    const outZones = root.querySelector('[data-out-zones]');
    const outLength = root.querySelector('[data-out-length]');
    const outExtras = root.querySelector('[data-out-extras]');
    const outPrice = root.querySelector('[data-out-price]');
    const outMeter = root.querySelector('[data-out-meter]');
    const outMeterLabel = root.querySelector('[data-out-meter-label]');
    const outNote = root.querySelector('[data-out-note]');

    // Opening selections: whatever carries data-default, else the first option.
    const defaultAge = root.querySelector('[data-age][data-default]') || ageBtns[0];
    const defaultLength = root.querySelector('[data-length][data-default]') || lengthBtns[0];

    const state = {
      age: defaultAge ? defaultAge.dataset.age : '',
      ageLabel: defaultAge ? defaultAge.dataset.label : '',
      zones: new Map(),
      length: defaultLength ? Number(defaultLength.dataset.length) : 60,
      lengthMultiplier: defaultLength ? Number(defaultLength.dataset.multiplier) : 1,
      lengthLabel: defaultLength ? defaultLength.dataset.label : '',
      extras: new Map()
    };

    const BASE = 24;

    function setPressed(group, active) {
      group.forEach((b) => b.setAttribute('aria-pressed', String(b === active)));
    }

    function bumpPrice() {
      if (!outPrice) return;
      outPrice.classList.add('is-bumped');
      setTimeout(() => outPrice.classList.remove('is-bumped'), 240);
    }

    function render() {
      const zoneNames = [...state.zones.values()].map((z) => z.label);
      const extraNames = [...state.extras.values()].map((x) => x.label);

      const zoneCost = [...state.zones.values()].reduce((sum, z) => sum + z.price, 0);
      const extraCost = [...state.extras.values()].reduce((sum, x) => sum + x.price, 0);
      const total = Math.round((BASE + zoneCost) * state.lengthMultiplier + extraCost);

      // "Care level" is a gentle guide: more services + longer distance means
      // extra comfort stops and dedicated telemetry.
      const load = Math.min(100, Math.round(state.zones.size * 22 + (state.length / 90) * 34));

      if (outAge) outAge.textContent = state.ageLabel || '—';
      if (outZones) outZones.textContent = zoneNames.length ? zoneNames.join(', ') : 'Pick at least one';
      if (outLength) outLength.textContent = state.lengthLabel;
      if (outExtras) outExtras.textContent = extraNames.length ? extraNames.join(', ') : 'None';
      if (outPrice) outPrice.textContent = '$' + total;
      if (outMeter) outMeter.style.width = load + '%';

      if (outMeterLabel) {
        outMeterLabel.textContent = load < 38 ? 'Standard Care' : load < 70 ? 'Enhanced Escort' : 'VIP Concierge';
      }

      if (outNote) {
        let note;
        if (!state.zones.size) {
          note = 'Select one or more cabin services and we will tailor the safest route for your pet.';
        } else if (load >= 70) {
          note = 'Full VIP Care selected. We will include hydration breaks, live cabin telemetry, and room-to-room handoff.';
        } else if (state.age === '0-12m') {
          note = 'Ideal for cats & small companions — we prepare a quiet acoustic zone with secure carrier anchoring.';
        } else {
          note = 'A smooth, balanced trip. Your certified pet chauffeur will pace boarding around your pet\'s comfort.';
        }
        outNote.textContent = note;
      }

      bumpPrice();
    }

    ageBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.age = btn.dataset.age;
        state.ageLabel = btn.dataset.label;
        setPressed(ageBtns, btn);
        render();
      });
    });

    zoneBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.zone;
        if (state.zones.has(key)) {
          state.zones.delete(key);
          btn.setAttribute('aria-pressed', 'false');
        } else {
          state.zones.set(key, { label: btn.dataset.label, price: Number(btn.dataset.price) });
          btn.setAttribute('aria-pressed', 'true');
        }
        render();
      });
    });

    lengthBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.length = Number(btn.dataset.length);
        state.lengthMultiplier = Number(btn.dataset.multiplier);
        state.lengthLabel = btn.dataset.label;
        setPressed(lengthBtns, btn);
        render();
      });
    });

    extraBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.extra;
        if (state.extras.has(key)) {
          state.extras.delete(key);
          btn.setAttribute('aria-pressed', 'false');
        } else {
          state.extras.set(key, { label: btn.dataset.label, price: Number(btn.dataset.price) });
          btn.setAttribute('aria-pressed', 'true');
        }
        render();
      });
    });

    // Sensible opening state so the panel never looks empty.
    if (defaultAge) defaultAge.setAttribute('aria-pressed', 'true');
    if (defaultLength) defaultLength.setAttribute('aria-pressed', 'true');
    const defaultZone = root.querySelector('[data-zone][data-default]');
    if (defaultZone) {
      state.zones.set(defaultZone.dataset.zone, {
        label: defaultZone.dataset.label,
        price: Number(defaultZone.dataset.price)
      });
      defaultZone.setAttribute('aria-pressed', 'true');
    }

    render();
  }
})();
