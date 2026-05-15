document.addEventListener("DOMContentLoaded", async () => {

  /* =====================================================
     HELPERS
  ===================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const cache = {};
  const exists = (selector) => !!$(selector);

  /* =====================================================
     HEADER SCROLL
  ===================================================== */
  const header = $(".site-header");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* =====================================================
     MOBILE MENU
  ===================================================== */
  const headerInner = $(".header-inner");
  const nav = $(".nav");

  if (headerInner && nav && !exists(".menu-toggle")) {
    const btn = document.createElement("button");
    btn.className = "menu-toggle";
    btn.setAttribute("aria-label", "Menu");

    btn.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    headerInner.appendChild(btn);
  }

  const menuBtn = $(".menu-toggle");

  menuBtn?.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });

  $$(".nav a").forEach(link => {
    link.addEventListener("click", () => nav?.classList.remove("open"));
  });

  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 980 &&
      nav?.classList.contains("open") &&
      !e.target.closest(".nav") &&
      !e.target.closest(".menu-toggle")
    ) {
      nav.classList.remove("open");
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) nav?.classList.remove("open");
  });

  /* =====================================================
     LANGUAGE SELECTOR
  ===================================================== */
  const headerActions = $(".header-actions") || headerInner;

  if (headerActions && !exists(".lang-box")) {
    const box = document.createElement("div");
    box.className = "lang-box";

    box.innerHTML = `
      <button class="lang-btn" id="langToggle">
        <span id="flag">🇧🇷</span>
        <span id="langText">PT</span>
        <span>▾</span>
      </button>

      <div class="lang-menu" id="langMenu">
        <button data-lang="pt">🇧🇷 Português</button>
        <button data-lang="en">🇺🇸 English</button>
        <button data-lang="es">es Español</button>
      </div>
    `;

    headerActions.appendChild(box);
  }

  const langToggle = $("#langToggle");
  const langMenu = $("#langMenu");
  const flag = $("#flag");
  const langText = $("#langText");

  langToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    langMenu?.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".lang-box")) {
      langMenu?.classList.remove("open");
    }
  });

  /* =====================================================
     TRANSLATION ENGINE
  ===================================================== */
  const I18N = (() => {

  let dict = {};

function getPage() {

  const path = window.location.pathname
    .toLowerCase()
    .split("/")
    .pop();

  if (path.includes("midia-paga")) {
    return "midia";
  }

  if (path.includes("afiliacao")) {
    return "afiliacao";
  }

  if (path.includes("programatica-anunciante")) {
    return "programaticaAdvertiser";
  }

  if (path.includes("programatica-publisher")) {
    return "programaticaPublisher";
  }

  return "home";
}

    async function load(l) {

    if (cache[l]) {
      dict = cache[l];
      return;
    }

    try {

      const res = await fetch(`i18n/${l}.json`);

      if (!res.ok) {
        throw new Error(`Erro ao carregar idioma: ${l}`);
      }

      dict = await res.json();

      cache[l] = dict;

    } catch (err) {

      console.error("I18N ERROR:", err);

    }
  }
  function get(path) {
    return path.split(".").reduce((o, i) => o?.[i], dict);
  }

  function apply() {
    const page = getPage();

    document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach(el => {
      const key =
        el.dataset.i18n ||
        el.dataset.i18nHtml;

      const value =
        (page ? get(`${page}.${key}`) : null) ||
        get(key) ||
        get(`global.${key}`);

      if (!value) {
        console.warn(`Missing translation: ${key}`);
        return;
      }

      if (
  typeof value === "string" &&
  /<[^>]+>/.test(value)
      ) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
        const supportEmailBtn = document.querySelector(
  'a[data-i18n="contact.cards.1.cta"]'
);
    if (supportEmailBtn) {

      let subject = "";
      let body = "";

      const currentLang =
        document.documentElement.lang;

      if (currentLang.includes("pt")) {

        subject =
          "Quero falar com especialista";

        body =
    `Olá, vim pelo site da TAG e quero entender como podem me ajudar.

    Nome:
    Empresa:
    Faturamento:
    Mensagem:`;

      } else if (currentLang.includes("es")) {

        subject =
          "Quiero hablar con un especialista";

        body =
    `Hola, vengo del sitio web de TAG y quiero entender cómo pueden ayudarme.

    Nombre:
    Empresa:
    Facturación:
    Mensaje:`;

      } else {

        subject =
          "I want to speak with a specialist";

        body =
    `Hello, I came from the TAG website and would like to understand how you can help me.

    Name:
    Company:
    Revenue:
    Message:`;

      }

      supportEmailBtn.href =
        `mailto:sales@tag.vc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    });
  }
async function init(l) {

  document.documentElement.lang =
    l === "pt"
      ? "pt-BR"
      : l === "es"
      ? "es"
      : "en";

  await load(l);

  apply();

  localStorage.setItem("lang", l);
}
  return { init };

})();

  /* =====================================================
     EVENTS
  ===================================================== */
$$(".lang-menu button").forEach(btn => {
  btn.addEventListener("click", async () => {

    const selectedLang = btn.dataset.lang;

    document.body.classList.add("lang-loading");
    try {
      await I18N.init(selectedLang);
    } finally {

      document.body.classList.remove("lang-loading");
    }

    if (flag) {
      flag.textContent =
        selectedLang === "pt"
          ? "🇧🇷"
          : selectedLang === "es"
          ? "🇪🇸"
          : "🇺🇸";
    }

    if (langText) {
      langText.textContent =
        selectedLang === "pt"
          ? "PT"
          : selectedLang === "es"
          ? "ES"
          : "EN";
    }

    localStorage.setItem("lang", selectedLang);

    langMenu?.classList.remove("open");

  });
});

/* =====================================================
   INITIAL LANGUAGE
===================================================== */
const browserLang =
  navigator.language.toLowerCase();

const savedLang =
  localStorage.getItem("lang") ||

  (browserLang.includes("pt")
    ? "pt"
    : browserLang.includes("es")
    ? "es"
    : "en");

await I18N.init(savedLang);

if (flag) {
    flag.textContent =
      savedLang === "pt"
        ? "🇧🇷"
        : savedLang === "es"
        ? "🇪🇸"
        : "🇺🇸";
}

if (langText) {
    langText.textContent =
      savedLang === "pt"
        ? "PT"
        : savedLang === "es"
        ? "ES"
        : "EN";
}
  /* =====================================================
     REVEAL SCROLL
  ===================================================== */
  const revealEls = $$(".section, .card, .solution-card, .case-premium");

  revealEls.forEach(el => el.classList.add("reveal-init"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-show");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  /* =====================================================
     HERO PARALLAX
  ===================================================== */
  const heroBg = $(".hero-bg");

  window.addEventListener("scroll", () => {
    if (heroBg) {
      heroBg.style.transform =
        `translateY(${window.scrollY * 0.18}px)`;
    }
  }, { passive: true });

});