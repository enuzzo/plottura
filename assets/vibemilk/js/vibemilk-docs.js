(() => {
  const STORAGE_KEY = "vibemilk.design-system.theme";
  const PREVIEW_STORAGE_KEY = "vibemilk.design-system.preview-mode";
  const DEFAULT_THEME = "vibemilk-default";
  const THEME_LINK_ID = "vibemilk-theme-file";

  /* Detect if we are inside pages/ directory to resolve theme CSS paths */
  const IS_SUBPAGE = document.body.getAttribute("data-vm-page") !== "hub" &&
    (location.pathname.includes("/pages/") || document.querySelector('link[href*="../css/"]') !== null);
  const PATH_PREFIX = IS_SUBPAGE ? "../" : "";

  const THEME_MANIFEST = {
    "vibemilk-default": null,
    "vibemilk-dark": PATH_PREFIX + "css/themes/vibemilk-dark.css",
    "cyber-grid": PATH_PREFIX + "css/themes/cyber-grid.css",
    "acid-pop": PATH_PREFIX + "css/themes/acid-pop.css",
    "sakura-spring": PATH_PREFIX + "css/themes/sakura-spring.css",
    "mono-brutalist": PATH_PREFIX + "css/themes/mono-brutalist.css",
    "mint-protocol": PATH_PREFIX + "css/themes/mint-protocol.css",
    "cathode-ray": PATH_PREFIX + "css/themes/cathode-ray.css",
    "clean-sheet": PATH_PREFIX + "css/themes/clean-sheet.css",
    "clean-sheet-dark": PATH_PREFIX + "css/themes/clean-sheet-dark.css",
    "solar-dust": PATH_PREFIX + "css/themes/solar-dust.css",
    "geocities-97": PATH_PREFIX + "css/themes/geocities-97.css"
  };

  function resolveTheme(themeId) {
    return Object.prototype.hasOwnProperty.call(THEME_MANIFEST, themeId) ? themeId : DEFAULT_THEME;
  }

  function getThemeLink() {
    return document.getElementById(THEME_LINK_ID);
  }

  function ensureThemeLink() {
    let link = getThemeLink();
    if (!link) {
      link = document.createElement("link");
      link.id = THEME_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    return link;
  }

  function updateTokenReadouts() {
    const rootStyles = getComputedStyle(document.documentElement);
    document.querySelectorAll("[data-token-value]").forEach((node) => {
      const tokenName = node.getAttribute("data-token-value");
      if (!tokenName) return;
      const tokenValue = rootStyles.getPropertyValue(tokenName).trim() || "-";
      node.textContent = tokenValue;
      node.title = tokenValue;
    });
  }

  function applyTheme(themeId, options = {}) {
    const { persist = true } = options;
    const nextTheme = resolveTheme(themeId);
    const themePath = THEME_MANIFEST[nextTheme];

    if (themePath) {
      ensureThemeLink().href = themePath;
    } else {
      const link = getThemeLink();
      if (link) link.remove();
    }

    document.documentElement.setAttribute("data-theme", nextTheme);

    if (persist) {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    }

    /* Update custom dropdown theme selectors */
    document.querySelectorAll("[data-vm-theme-select]").forEach((dropdown) => {
      const valueEl = dropdown.querySelector(".vm-dropdown__value");
      if (valueEl) {
        const targetItem = dropdown.querySelector('.vm-dropdown__item[data-value="' + nextTheme + '"]');
        if (targetItem) {
          dropdown.querySelectorAll(".vm-dropdown__item").forEach((i) => {
            i.classList.remove("is-selected");
            i.setAttribute("aria-selected", "false");
          });
          targetItem.classList.add("is-selected");
          targetItem.setAttribute("aria-selected", "true");
          valueEl.textContent = targetItem.textContent.trim();
        }
      }
    });

    document.querySelectorAll("[data-vm-theme-current]").forEach((node) => {
      node.textContent = nextTheme;
    });

    const activeTheme = document.getElementById("activeThemeId");
    if (activeTheme) {
      activeTheme.textContent = nextTheme;
    }

    updateTokenReadouts();
    updateModeButtons(nextTheme);

    return nextTheme;
  }

  function initThemeSelectors() {
    const current = resolveTheme(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);
    applyTheme(current, { persist: false });
  }

  function resolvePreviewMode(mode) {
    return mode === "mobile" ? "mobile" : "desktop";
  }

  function applyPreviewMode(mode, options = {}) {
    const { persist = true } = options;
    const nextMode = resolvePreviewMode(mode);

    document.documentElement.setAttribute("data-vm-preview-mode", nextMode);
    document.body.setAttribute("data-vm-preview-mode", nextMode);

    document.querySelectorAll("[data-vm-preview-canvas]").forEach((node) => {
      node.setAttribute("data-vm-preview-mode", nextMode);
    });

    document.querySelectorAll("[data-vm-preview-button]").forEach((button) => {
      const isActive = button.getAttribute("data-vm-preview-button") === nextMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-vm-preview-current]").forEach((node) => {
      node.textContent = nextMode;
    });

    if (persist) {
      localStorage.setItem(PREVIEW_STORAGE_KEY, nextMode);
    }

    return nextMode;
  }

  function replayAnimation(targetId = "animDemo") {
    const demo = document.getElementById(targetId);
    if (!demo) return;

    demo.querySelectorAll(".vm-stat").forEach((card) => {
      card.style.animation = "none";
      void card.offsetHeight;
      card.style.animation = "";
    });
  }

  /* ===== Animation demo system ===== */
  let currentAnimSpeed = "normal";

  function replayAnimDemo(stage) {
    if (!stage) return;
    const animClass = stage.getAttribute("data-vm-anim-demo");
    if (!animClass) return;

    const cards = stage.querySelectorAll(".vm-stat");
    cards.forEach((card) => {
      /* Remove animation class + speed class, force reflow, re-add */
      card.classList.remove(animClass, "vm-anim-slow", "vm-anim-normal", "vm-anim-fast");
      card.style.opacity = "0";
    });

    /* Force reflow */
    void stage.offsetHeight;

    const speedClass = "vm-anim-" + currentAnimSpeed;
    cards.forEach((card) => {
      card.classList.add(animClass, speedClass);
      card.style.opacity = "";
    });
  }

  function initAnimDemos() {
    /* Speed selector */
    document.addEventListener("click", (event) => {
      const speedBtn = event.target.closest("[data-vm-speed]");
      if (!speedBtn) return;
      event.preventDefault();

      const group = speedBtn.closest("[data-vm-anim-speed]");
      if (!group) return;

      group.querySelectorAll("[data-vm-speed]").forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      speedBtn.classList.add("active");
      speedBtn.setAttribute("aria-selected", "true");
      currentAnimSpeed = speedBtn.getAttribute("data-vm-speed");

      /* Replay all demos with new speed */
      document.querySelectorAll("[data-vm-anim-demo]").forEach((stage) => {
        replayAnimDemo(stage);
      });
    });

    /* Per-demo replay buttons */
    document.addEventListener("click", (event) => {
      const replayBtn = event.target.closest("[data-vm-anim-replay]");
      if (!replayBtn) return;
      event.preventDefault();

      const box = replayBtn.closest(".vm-anim-demo-box");
      if (!box) return;
      const stage = box.querySelector("[data-vm-anim-demo]");
      replayAnimDemo(stage);
    });

    /* Initial play — apply animation classes on load */
    document.querySelectorAll("[data-vm-anim-demo]").forEach((stage) => {
      const animClass = stage.getAttribute("data-vm-anim-demo");
      const speedClass = "vm-anim-" + currentAnimSpeed;
      stage.querySelectorAll(".vm-stat").forEach((card) => {
        card.classList.add(animClass, speedClass);
      });
    });
  }

  function initPreviewMode() {
    const currentMode = resolvePreviewMode(localStorage.getItem(PREVIEW_STORAGE_KEY) || "desktop");
    applyPreviewMode(currentMode, { persist: false });

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-vm-preview-button]");
      if (!button) return;
      event.preventDefault();
      applyPreviewMode(button.getAttribute("data-vm-preview-button"));
    });

    document.querySelectorAll("[data-vm-replay-anim]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-vm-replay-anim") || "animDemo";
        replayAnimation(targetId);
      });
    });
  }


  function applyQuicknavVisibility() {
    const isVisible = window.scrollY >= 200;
    document.body.classList.toggle("vm-docs--quicknav-visible", isVisible);
  }

  function setCurrentSectionLabel(link) {
    if (!link) return;
    const label = (link.textContent || "").replace(/^\d+\.\s*/, "").trim() || "Intro";
    document.querySelectorAll("[data-vm-current-section]").forEach((node) => {
      node.textContent = label;
    });
  }

  function initScrollChrome() {
    applyQuicknavVisibility();
    window.addEventListener("scroll", applyQuicknavVisibility, { passive: true });
  }

  /* Multi-page section spy: only observes sections with anchor-only links on this page */
  function initSectionSpy() {
    const links = Array.from(document.querySelectorAll("[data-vm-nav]"));
    if (!links.length) return;

    const map = new Map();
    links.forEach((link) => {
      const hash = link.getAttribute("href");
      /* Only track links that are anchor-only (current page sections) */
      if (!hash || !hash.startsWith("#")) return;
      const id = hash.slice(1);
      map.set(id, link);
    });

    const sections = Array.from(document.querySelectorAll("[data-vm-section]")).filter((section) => map.has(section.id));
    if (!sections.length) return;

    /* Section spy: IntersectionObserver tracks which section is visible
       during free scroll. On click navigation, the observer is fully
       disconnected to prevent any interference, then reconnected when
       the user starts scrolling manually again. */

    const setActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle("is-active", link === map.get(id));
      });
      setCurrentSectionLabel(map.get(id));
    };

    if (sections[0]) {
      setActive(sections[0].id);
    }

    const observerCallback = (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      setActive(visible[0].target.id);
    };

    const observerOptions = {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0.25, 0.5, 0.75]
    };

    let observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    /* Reconnect observer on genuine user scroll */
    const reconnectObserver = () => {
      observer = new IntersectionObserver(observerCallback, observerOptions);
      sections.forEach((section) => observer.observe(section));
      window.removeEventListener("wheel", reconnectObserver);
      window.removeEventListener("touchstart", reconnectObserver);
      window.removeEventListener("keydown", reconnectOnKey);
    };
    const reconnectOnKey = (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
        reconnectObserver();
      }
    };

    links.forEach((link) => {
      link.addEventListener("click", () => {
        const hash = link.getAttribute("href");
        if (hash && hash.startsWith("#")) {
          setActive(hash.slice(1));
          /* Fully disconnect observer — no callbacks can fire */
          observer.disconnect();
          /* Reconnect only when user scrolls manually */
          window.addEventListener("wheel", reconnectObserver, { passive: true, once: true });
          window.addEventListener("touchstart", reconnectObserver, { passive: true, once: true });
          window.addEventListener("keydown", reconnectOnKey);
        }
      });
    });
  }

  /* Detect current page and dim cross-page nav links */
  function initCurrentPageHighlight() {
    const pageName = document.body.getAttribute("data-vm-page");
    if (!pageName || pageName === "hub") return;

    document.querySelectorAll("[data-vm-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      link.classList.add("vm-docs__nav-link--cross-page");
    });
  }

  const SIDEBAR_SCROLL_KEY = "vibemilk.design-system.sidebar-scroll";

  function initSidebarScrollPersistence() {
    const nav = document.querySelector(".vm-docs__nav");
    if (!nav) return;

    const saveScroll = () => {
      try {
        sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(nav.scrollTop));
      } catch (_) {
        /* sessionStorage can fail in private modes or locked-down browsers */
      }
    };

    const restoreScroll = () => {
      try {
        const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
        if (saved === null) return;
        nav.scrollTop = Number(saved) || 0;
      } catch (_) {
        /* Ignore restore failures and keep the browser default */
      }
    };

    restoreScroll();
    requestAnimationFrame(restoreScroll);

    nav.addEventListener("scroll", saveScroll, { passive: true });

    document.addEventListener("click", (event) => {
      const navTarget = event.target.closest("[data-vm-nav], .vm-docs__nav-group-header");
      if (navTarget) saveScroll();
    });

    window.addEventListener("pagehide", saveScroll);
  }

  window.VibemilkThemeManager = {
    themes: Object.freeze(Object.keys(THEME_MANIFEST)),
    manifest: Object.freeze({ ...THEME_MANIFEST }),
    applyTheme,
    applyPreviewMode,
    resolveTheme,
    initThemeSelectors,
    replayAnimation,
    updateTokenReadouts
  };

  /* ===== 4.2 Sidebar search filter ===== */
  function initNavSearch() {
    const input = document.querySelector(".vm-docs__search-input");
    if (!input) return;

    const groups = Array.from(document.querySelectorAll(".vm-docs__nav-group"));
    const links = Array.from(document.querySelectorAll(".vm-docs__nav-link[data-vm-nav]"));

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();

      if (!query) {
        links.forEach((link) => link.classList.remove("is-hidden"));
        groups.forEach((group) => group.classList.remove("is-search-hidden"));
        return;
      }

      groups.forEach((group) => {
        const groupLinks = Array.from(group.querySelectorAll(".vm-docs__nav-link"));
        let anyVisible = false;

        groupLinks.forEach((link) => {
          const text = (link.textContent || "").toLowerCase();
          const match = text.includes(query);
          link.classList.toggle("is-hidden", !match);
          if (match) anyVisible = true;
        });

        group.classList.toggle("is-search-hidden", !anyVisible);
      });
    });
  }

  /* ===== 4.2 Collapsible nav groups ===== */
  function initNavGroups() {
    document.querySelectorAll(".vm-docs__nav-group-header").forEach((header) => {
      header.addEventListener("click", () => {
        const group = header.closest(".vm-docs__nav-group");
        if (group) group.classList.toggle("is-collapsed");
      });
    });
  }

  /* ===== 4.3 Copy-to-clipboard ===== */
  function showDocsToast(message) {
    let toast = document.getElementById("vm-docs-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "vm-docs-toast";
      toast.className = "vm-docs-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showDocsToast("Copied!");
      });
    } else {
      /* Fallback for older browsers */
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showDocsToast("Copied!");
    }
  }

  function initCopyTokenValues() {
    document.addEventListener("click", (event) => {
      const tokenEl = event.target.closest("[data-token-value]");
      if (!tokenEl) return;
      const value = tokenEl.textContent.trim();
      if (value && value !== "-") {
        copyToClipboard(value);
      }
    });
  }

  function initCopyCodeBlocks() {
    document.querySelectorAll("pre.vm-code").forEach((pre) => {
      /* Skip if already wrapped */
      if (pre.parentElement && pre.parentElement.classList.contains("vm-code-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "vm-code-wrapper";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vm-code-copy";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        const text = pre.textContent || "";
        copyToClipboard(text);
        btn.textContent = "Copied!";
        btn.classList.add("is-copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("is-copied");
        }, 2000);
      });
      wrapper.insertBefore(btn, pre);
    });
  }

  /* ===== 4.4 View Source Toggle ===== */
  function initViewSource() {
    document.querySelectorAll("[data-vm-view-source]").forEach((section) => {
      const demoContainer = section.querySelector(".vm-view-source-demo");
      if (!demoContainer) return;

      const btn = section.querySelector(".vm-view-source-btn");
      const panel = section.querySelector(".vm-view-source-panel");
      if (!btn || !panel) return;

      /* Populate the source panel with the demo HTML */
      const sourceCode = demoContainer.innerHTML
        .replace(/^\s*\n/, "")
        .replace(/\n\s*$/, "");

      /* Simple indentation cleanup */
      const lines = sourceCode.split("\n");
      const minIndent = lines
        .filter((l) => l.trim().length > 0)
        .reduce((min, l) => {
          const indent = l.match(/^(\s*)/)[1].length;
          return Math.min(min, indent);
        }, Infinity);

      const cleaned = lines.map((l) => l.slice(minIndent)).join("\n").trim();

      const pre = document.createElement("pre");
      pre.className = "vm-code";
      pre.textContent = cleaned;
      panel.appendChild(pre);

      /* Wire up the copy button for this new code block */
      const wrapper = document.createElement("div");
      wrapper.className = "vm-code-wrapper";
      panel.innerHTML = "";
      wrapper.appendChild(pre);
      panel.appendChild(wrapper);

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "vm-code-copy";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        copyToClipboard(cleaned);
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("is-copied");
        setTimeout(() => {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("is-copied");
        }, 2000);
      });
      wrapper.insertBefore(copyBtn, pre);

      btn.addEventListener("click", () => {
        const isVisible = panel.classList.toggle("is-visible");
        btn.classList.toggle("is-active", isVisible);
        btn.querySelector(".vm-view-source-label").textContent = isVisible ? "Hide Source" : "View Source";
      });
    });
  }

  /* ===== 4.6 Scroll entrance animations ===== */
  function initScrollAnimations() {
    const targets = document.querySelectorAll(".vm-section, .showcase-section");
    if (!targets.length) return;

    targets.forEach((el) => el.classList.add("vm-animate-on-scroll"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.05 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ===== 4.7 Day/Night theme toggle ===== */
  const THEME_MODE_MAP = {
    "vibemilk-default": "light",
    "vibemilk-dark": "dark",
    "cyber-grid": "dark",
    "acid-pop": "dark",
    "sakura-spring": "light",
    "mono-brutalist": "dark",
    "mint-protocol": "light",
    "cathode-ray": "dark",
    "clean-sheet": "light",
    "clean-sheet-dark": "dark",
    "solar-dust": "dark",
    "geocities-97": "light"
  };

  function getThemeMode(themeId) {
    return THEME_MODE_MAP[themeId] || "dark";
  }

  const MODE_STORAGE_KEY = "vibemilk.design-system.mode";

  /*
   * Light/dark pairs: themes that have a counterpart in the other mode.
   * Key = theme id, value = its counterpart theme id.
   * Themes without a pair simply show their mode as read-only.
   */
  const THEME_PAIRS = {
    "vibemilk-default": "vibemilk-dark",
    "vibemilk-dark": "vibemilk-default",
    "clean-sheet": "clean-sheet-dark",
    "clean-sheet-dark": "clean-sheet",
  };

  function updateModeButtons(themeId) {
    const currentMode = getThemeMode(themeId);
    const hasPair = !!THEME_PAIRS[themeId];
    const vmMode = currentMode === "light" ? "day" : "night";

    /* Update sidebar toggle */
    document.querySelectorAll("[data-vm-sidebar-toggle]").forEach((toggle) => {
      toggle.setAttribute("data-vm-mode", vmMode);
      const label = toggle.querySelector(".vm-theme-toggle__label");
      if (label) label.textContent = vmMode;
      if (!hasPair) {
        toggle.classList.add("is-disabled");
        toggle.setAttribute("title", "No " + (vmMode === "day" ? "night" : "day") + " variant for this theme");
      } else {
        toggle.classList.remove("is-disabled");
        toggle.removeAttribute("title");
      }
    });

    /* Update standalone demo toggles (non-sidebar) */
    document.querySelectorAll("[data-vm-theme-toggle]").forEach((toggle) => {
      toggle.setAttribute("data-vm-mode", vmMode);
      const label = toggle.querySelector(".vm-theme-toggle__label");
      if (label) label.textContent = vmMode;
    });

    /* Legacy mode buttons (if any remain) */
    document.querySelectorAll("[data-vm-mode-button]").forEach((button) => {
      const btnMode = button.getAttribute("data-vm-mode-button");
      const isActive = btnMode === currentMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      if (!isActive && !hasPair) {
        button.classList.add("is-disabled");
        button.setAttribute("title", "No " + btnMode + " variant for this theme");
      } else {
        button.classList.remove("is-disabled");
        button.removeAttribute("title");
      }
    });
  }

  function applyModeTheme(targetMode) {
    const currentTheme = resolveTheme(document.documentElement.getAttribute("data-theme") || DEFAULT_THEME);
    const paired = THEME_PAIRS[currentTheme];
    if (paired) {
      applyTheme(paired);
    }
    /* If no pair exists, do nothing — button is disabled */
  }

  function initThemeToggle() {
    const currentTheme = resolveTheme(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME);
    updateModeButtons(currentTheme);

    /* Click handler for sidebar toggle */
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-vm-sidebar-toggle]");
      if (toggle && !toggle.classList.contains("is-disabled")) {
        event.preventDefault();
        const currentMode = toggle.getAttribute("data-vm-mode");
        const targetMode = currentMode === "day" ? "dark" : "light";
        localStorage.setItem(MODE_STORAGE_KEY, targetMode);
        applyModeTheme(targetMode);
        return;
      }

      /* Legacy mode buttons */
      const button = event.target.closest("[data-vm-mode-button]");
      if (!button || button.classList.contains("is-disabled")) return;
      event.preventDefault();
      const mode = button.getAttribute("data-vm-mode-button");
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      applyModeTheme(mode);
    });

    /* Keyboard support for sidebar toggle (Enter / Space) */
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const toggle = event.target.closest("[data-vm-sidebar-toggle]");
      if (!toggle || toggle.classList.contains("is-disabled")) return;
      event.preventDefault();
      const currentMode = toggle.getAttribute("data-vm-mode");
      const targetMode = currentMode === "day" ? "dark" : "light";
      localStorage.setItem(MODE_STORAGE_KEY, targetMode);
      applyModeTheme(targetMode);
    });

  }

  /* ===== 4.7b Dropdown behavior ===== */
  function initDropdowns() {
    /* Toggle dropdown on trigger click */
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest(".vm-dropdown__trigger");
      if (trigger) {
        const dropdown = trigger.closest(".vm-dropdown");
        if (!dropdown || dropdown.classList.contains("vm-dropdown--disabled")) return;
        event.preventDefault();

        /* Close all other open dropdowns first */
        document.querySelectorAll(".vm-dropdown.is-open").forEach((d) => {
          if (d !== dropdown) {
            d.classList.remove("is-open");
            const t = d.querySelector(".vm-dropdown__trigger");
            if (t) t.setAttribute("aria-expanded", "false");
          }
        });

        const isOpen = dropdown.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
        return;
      }

      /* Select an item */
      const item = event.target.closest(".vm-dropdown__item");
      if (item) {
        const dropdown = item.closest(".vm-dropdown");
        if (!dropdown) return;

        /* Update selected state */
        dropdown.querySelectorAll(".vm-dropdown__item").forEach((i) => {
          i.classList.remove("is-selected");
          i.setAttribute("aria-selected", "false");
        });
        item.classList.add("is-selected");
        item.setAttribute("aria-selected", "true");

        /* Update displayed value */
        const valueEl = dropdown.querySelector(".vm-dropdown__value");
        if (valueEl) {
          valueEl.textContent = item.textContent.trim();
        }

        /* If this is a theme selector dropdown, apply the theme */
        if (dropdown.hasAttribute("data-vm-theme-select")) {
          const themeValue = item.getAttribute("data-value");
          if (themeValue) {
            applyTheme(themeValue, { persist: true });
            const themeMode = getThemeMode(resolveTheme(themeValue));
            localStorage.setItem(MODE_STORAGE_KEY, themeMode);
          }
        }

        /* Close the menu */
        dropdown.classList.remove("is-open");
        const trigger2 = dropdown.querySelector(".vm-dropdown__trigger");
        if (trigger2) trigger2.setAttribute("aria-expanded", "false");
        return;
      }

      /* Click outside — close all open dropdowns */
      document.querySelectorAll(".vm-dropdown.is-open").forEach((d) => {
        d.classList.remove("is-open");
        const t = d.querySelector(".vm-dropdown__trigger");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===== 4.8 Language selector ===== */
  function initLangSelect() {
    document.addEventListener("click", (event) => {
      const option = event.target.closest(".vm-lang-select__option");
      if (!option) return;
      event.preventDefault();

      const parent = option.closest(".vm-lang-select");
      if (!parent) return;

      parent.querySelectorAll(".vm-lang-select__option").forEach((opt) => {
        opt.classList.remove("active");
        opt.setAttribute("aria-selected", "false");
      });

      option.classList.add("active");
      option.setAttribute("aria-selected", "true");
    });
  }

  /* ===== 4.6 Mobile hamburger ===== */
  function initMobileHamburger() {
    const pageName = document.body.getAttribute("data-vm-page");
    if (pageName === "hub") return;

    /* Create hamburger button */
    const hamburger = document.createElement("button");
    hamburger.type = "button";
    hamburger.className = "vm-docs__hamburger";
    hamburger.setAttribute("aria-label", "Toggle navigation");
    hamburger.innerHTML = '<svg class="vm-docs__hamburger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

    /* Create overlay */
    const overlay = document.createElement("div");
    overlay.className = "vm-docs__sidebar-overlay";

    document.body.appendChild(hamburger);
    document.body.appendChild(overlay);

    hamburger.addEventListener("click", () => {
      document.body.classList.toggle("vm-sidebar-open");
    });

    overlay.addEventListener("click", () => {
      document.body.classList.remove("vm-sidebar-open");
    });
  }

  window.replayAnimation = replayAnimation;

  document.addEventListener("DOMContentLoaded", () => {
    initThemeSelectors();
    initPreviewMode();
    initScrollChrome();
    initSectionSpy();
    initCurrentPageHighlight();
    initSidebarScrollPersistence();
    initNavSearch();
    initNavGroups();
    initCopyTokenValues();
    initCopyCodeBlocks();
    initViewSource();
    initScrollAnimations();
    initMobileHamburger();
    initThemeToggle();
    initDropdowns();
    initLangSelect();
    initAnimDemos();
  });
})();
