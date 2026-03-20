const revealElements = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const menuBackdrop = document.querySelector(".menu-backdrop");
const langButtons = document.querySelectorAll("[data-lang-toggle]");
document.documentElement.classList.add("js");

const menuNotesByHref = {
  "index.html": "Spa sensoriel a Paris",
  "concept.html": "Vision, equipe, philosophie",
  "cabines.html": "5 univers immersifs",
  "soins.html": "Choisir selon votre besoin",
  "jeu.html": "Tente de gagner un soin",
  "reservation.html": "Rendez-vous pre-rempli",
  "contact.html": "Acces, horaires, questions",
  "connexion.html": "Compte et fidelite"
};

const careTagMap = {
  Californien: ["Ideal apres une semaine intense", "Parfait en premiere visite"],
  Shiatsu: ["Tensions cervicales", "Recentrage rapide"],
  Suedois: ["Recuperation musculaire", "Ideal apres le sport"],
  "Thai a l'huile": ["Corps raide", "Energie relancee"],
  Mauresque: ["Besoin de cocon", "Lacher-prise profond"],
  Balinais: ["Relance douce", "Evasion immediate"],
  Abhyanga: ["Mieux dormir", "Ancrage et chaleur"],
  "Lomi Lomi": ["Massage enveloppant", "Esprit plus leger"],
  "A la bougie": ["Reconfort", "Peau nourrie"],
  "Aux bambous": ["Pression soutenue", "Top apres tensions installees"],
  "Aux pochons": ["Chaleur diffuse", "Ideal en hiver"],
  "Rituel Oriental": ["Top cadeau", "Parfait en duo"],
  "Rituel Ayurvedique": ["Stress intense", "Retour au calme"],
  "Rituel Balinais": ["Besoin d'evasion", "Corps fatigue"],
  "Rituel Nordique": ["Grande recuperation", "Saison froide"],
  Hydratant: ["Teint fatigue", "Avant un evenement"],
  Purifiant: ["Peau brouillee", "Effet net et frais"],
  "Anti-age (Kobido)": ["Traits froisses", "Visage tonifie"],
  "Acces spa": ["Recuperation douce", "Moment calme"],
  "Formules solo et duo": ["Parfait en duo", "Occasion speciale"]
};

const needRecommendationMap = {
  "mieux-dormir": {
    intro: "Trois options si votre priorite est de relacher le systeme nerveux et de retrouver une sensation de calme le soir meme.",
    items: [
      {
        title: "Californien",
        soin: "Californien",
        cabine: "Europe",
        duration: "60 min",
        price: "95 EUR",
        reason: "Un massage enveloppant qui rassure le corps avant tout et aide a faire redescendre la charge mentale.",
        tags: ["Mieux dormir", "Premiere visite"]
      },
      {
        title: "Abhyanga",
        soin: "Abhyanga",
        cabine: "Bali",
        duration: "75 min",
        price: "125 EUR",
        reason: "Huile chaude, rythme lent et sensation d'ancrage pour les semaines ou tout va trop vite.",
        tags: ["Ancrage", "Chaleur"]
      },
      {
        title: "Rituel Ayurvedique",
        soin: "Rituel Ayurvedique",
        cabine: "Bali",
        duration: "1 h 30",
        price: "145 EUR",
        reason: "Une experience plus longue pour couper vraiment et laisser redescendre la tension accumulee.",
        tags: ["Stress intense", "Rituel profond"]
      }
    ]
  },
  douleurs: {
    intro: "Si votre objectif est surtout de delier le corps, voici les soins les plus utiles pour les tensions installees.",
    items: [
      {
        title: "Shiatsu",
        soin: "Shiatsu",
        cabine: "Japon",
        duration: "60 min",
        price: "100 EUR",
        reason: "Pressions ciblees et recentrage pour les nuques, epaules et dos sursollicites.",
        tags: ["Tensions cervicales", "Focus precision"]
      },
      {
        title: "Suedois",
        soin: "Suedois",
        cabine: "Europe",
        duration: "60 min",
        price: "100 EUR",
        reason: "Tres adapte aux corps fatigues, sportifs ou restes trop longtemps dans la meme posture.",
        tags: ["Recuperation", "Muscles fatigues"]
      },
      {
        title: "Massage aux bambous",
        soin: "Massage aux bambous",
        cabine: "Bali",
        duration: "60 min",
        price: "115 EUR",
        reason: "Quand les tensions sont deja bien installees et qu'il faut un travail plus profond.",
        tags: ["Pression soutenue", "Jambes lourdes"]
      }
    ]
  },
  "lacher-prise": {
    intro: "Quand vous avez surtout besoin de souffler, de couper avec l'exterieur et de retrouver une sensation de refuge.",
    items: [
      {
        title: "Mauresque",
        soin: "Mauresque",
        cabine: "Mauresque",
        duration: "75 min",
        price: "120 EUR",
        reason: "Chaleur, cocon et gestes enveloppants pour les jours ou vous voulez juste ralentir.",
        tags: ["Besoin de cocon", "Lenteur"]
      },
      {
        title: "Rituel Oriental",
        soin: "Rituel Oriental",
        cabine: "Mauresque",
        duration: "1 h 45",
        price: "165 EUR",
        reason: "Le bon choix si vous voulez une vraie parenthese, seul ou a deux, avec une sensation de voyage.",
        tags: ["Top cadeau", "Parfait en duo"]
      },
      {
        title: "Spa privatif duo",
        soin: "",
        cabine: "Europe",
        duration: "1 h a 2 h",
        price: "100 a 170 EUR",
        reason: "Une bulle plus intime pour faire une pause ensemble sans forcement choisir un rituel complet.",
        tags: ["Moment a deux", "Decompression douce"],
        format: "Duo",
        note: "Je souhaite reserver le spa privatif duo"
      }
    ]
  }
};

const phrasePairs = [
  ["Menu", "Menu"],
  ["Accueil", "Home"],
  ["Concept", "Concept"],
  ["Cabines", "Cabins"],
  ["Soins", "Treatments"],
  ["Jeu", "Game"],
  ["Reservation", "Booking"],
  ["Contact", "Contact"],
  ["Connexion", "Login"],
  ["Reserver", "Book now"],
  ["Voir les soins", "See treatments"],
  ["Spa holistique et sensoriel", "Holistic and sensory spa"],
  ["Un voyage des sens, cabine apres cabine.", "A sensory journey, cabin after cabin."],
  ["Inspire par des univers culturels immersifs: Japon, Bali, Europe, Thailande et Mauresque.", "Inspired by immersive cultural worlds: Japan, Bali, Europe, Thailand and Moorish."],
  ["Concept de marque", "Brand concept"],
  ["Cabines thematiques", "Themed cabins"],
  ["Chaque destination propose une ambiance, une signature olfactive et une gestuelle adaptee.", "Each destination offers a unique ambiance, scent signature, and adapted gestures."],
  ["Navigation rapide", "Quick navigation"],
  ["Selection des destinations", "Destination selection"],
  ["Formats et configuration", "Formats and setup"],
  ["Cabine solo", "Solo cabin"],
  ["Cabine duo", "Duo cabin"],
  ["Bain nordique exterieur disponible d'octobre a avril, selon conditions meteo.", "Outdoor Nordic bath available from October to April, depending on weather."],
  ["Univers immersifs", "Immersive universes"],
  ["Univers des cabines", "Cabin worlds"],
  ["Vision et intention", "Vision and intention"],
  ["Type de spa", "Spa type"],
  ["Objectif du concept", "Concept objective"],
  ["Client cible et promesse", "Target client and promise"],
  ["Attentes principales", "Main expectations"],
  ["Promesse client", "Client promise"],
  ["Parcours client global", "Full client journey"],
  ["Fidelite et relation client", "Loyalty and client relationship"],
  ["Positionnement de marque", "Brand positioning"],
  ["Ambiance du Temple", "Temple atmosphere"],
  ["Grille tarifaire", "Price list"],
  ["Tarifs fournis par vos soins.", "Prices provided by you."],
  ["Spa privatif interieur / exterieur", "Private spa indoor / outdoor"],
  ["Acces spa", "Spa access"],
  ["Formules", "Packages"],
  ["Massages du monde", "World massages"],
  ["Massages avec accessoires", "Accessory massages"],
  ["Rituels", "Rituals"],
  ["Soins du visage", "Facial treatments"],
  ["Le Temple - 2026", "Le Temple - 2026"],
  ["Prise de rendez-vous", "Appointment booking"],
  ["Reserver un soin", "Book a treatment"],
  ["Nom complet", "Full name"],
  ["Email", "Email"],
  ["Telephone", "Phone"],
  ["Soin souhaite", "Desired treatment"],
  ["Choisir un soin", "Choose a treatment"],
  ["Cabine souhaitee", "Preferred cabin"],
  ["Choisir une cabine", "Choose a cabin"],
  ["Date souhaitee", "Preferred date"],
  ["Heure souhaitee", "Preferred time"],
  ["Choisir d'abord une date", "Choose a date first"],
  ["Format", "Format"],
  ["Choisir un format", "Choose a format"],
  ["Solo", "Solo"],
  ["Duo", "Duo"],
  ["Message", "Message"],
  ["Envoyer la demande", "Send request"],
  ["Les creneaux se chargent selon la cabine et la date choisies (10h-22h).", "Slots load according to selected cabin and date (10am-10pm)."],
  ["Avant votre venue", "Before your visit"],
  ["Besoin d'informations", "Need information"],
  ["Envoyer un message", "Send a message"],
  ["Nom", "Name"],
  ["Sujet", "Subject"],
  ["Envoyer", "Send"],
  ["Coordonnees", "Contact details"],
  ["Adresse: 12 Avenue du Voyage Sensoriel, 75000 Paris", "Address: 12 Avenue du Voyage Sensoriel, 75000 Paris"],
  ["Horaires: Lundi - Dimanche, 10h00 - 22h00", "Hours: Monday - Sunday, 10:00 - 22:00"],
  ["Espace client", "Client area"],
  ["Se connecter", "Sign in"],
  ["Mot de passe", "Password"],
  ["Acceder a mon compte", "Access my account"],
  ["Creer un compte", "Create an account"],
  ["Mot de passe (8 caracteres minimum)", "Password (minimum 8 characters)"],
  ["Creer mon compte", "Create my account"],
  ["Programme fidelite", "Loyalty program"],
  ["Jeu quotidien", "Daily game"],
  ["Un tirage par jour pour gagner des points et des avantages exclusifs.", "One spin per day to win points and exclusive perks."],
  ["Mon espace jeu", "My game area"],
  ["Email client", "Client email"],
  ["Charger mon profil", "Load my profile"],
  ["Lancer mon tirage du jour", "Run today's spin"],
  ["Points", "Points"],
  ["Dernier tirage", "Last spin"],
  ["Aucun tirage", "No spin yet"],
  ["Historique recent", "Recent history"],
  ["Aucune partie pour le moment", "No game yet"],
  ["Soin immersif", "Immersive treatment"],
  ["Ambiance multisensorielle", "Multisensory ambiance"],
  ["Parcours personnalise", "Personalized journey"],
  ["Bien-etre premium", "Premium wellbeing"],
  ["Focus ambiance par cabine", "Cabin atmosphere highlights"],
  ["Japon", "Japan"],
  ["Thailande", "Thailand"],
  ["Mauresque", "Moorish"],
  ["Bali", "Bali"],
  ["Europe", "Europe"],
  ["Californien", "Californian"],
  ["Suedois", "Swedish"],
  ["Thai a l'huile", "Thai oil massage"],
  ["Hydratant", "Hydrating"],
  ["Purifiant", "Purifying"],
  ["Anti-age (Kobido)", "Anti-aging (Kobido)"],
  ["Rituel Oriental", "Oriental Ritual"],
  ["Rituel Balinais", "Balinese Ritual"],
  ["Rituel Ayurvedique", "Ayurvedic Ritual"],
  ["Rituel Nordique", "Nordic Ritual"]
];

const frToEn = Object.fromEntries(phrasePairs);
const enToFr = Object.fromEntries(phrasePairs.map(([fr, en]) => [en, fr]));
const soinCabinMap = {
  Shiatsu: "Japon",
  "Soin visage anti-age (Kobido)": "Japon",
  Californien: "Europe",
  Suedois: "Europe",
  "Massage a la bougie": "Europe",
  "Soin visage hydratant": "Europe",
  "Soin visage purifiant": "Europe",
  "Thai a l'huile": "Thailande",
  "Massage aux pochons": "Thailande",
  Mauresque: "Mauresque",
  "Rituel Oriental": "Mauresque",
  Balinais: "Bali",
  "Rituel Balinais": "Bali",
  Abhyanga: "Bali",
  "Rituel Ayurvedique": "Bali",
  "Massage aux bambous": "Bali",
  "Lomi Lomi": "Bali",
  "Rituel Nordique": "Europe"
};

const i18n = {
  fr: {
    menu: "Menu",
    nav_home: "Accueil",
    nav_concept: "Concept",
    nav_cabins: "Cabines",
    nav_care: "Soins",
    nav_game: "Jeu",
    nav_booking: "Reservation",
    nav_contact: "Contact",
    nav_login: "Connexion",
    cta_book: "Reserver",
    cta_view_care: "Voir les soins",
    cabins_title: "Cabines thematiques",
    cabins_lead: "Chaque destination propose une ambiance, une signature olfactive et une gestuelle adaptee."
  },
  en: {
    menu: "Menu",
    nav_home: "Home",
    nav_concept: "Concept",
    nav_cabins: "Cabins",
    nav_care: "Treatments",
    nav_game: "Game",
    nav_booking: "Booking",
    nav_contact: "Contact",
    nav_login: "Login",
    cta_book: "Book now",
    cta_view_care: "See treatments",
    cabins_title: "Themed cabins",
    cabins_lead: "Each destination offers a unique ambiance, scent profile, and tailored treatment style."
  }
};

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function humanizeNeed(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildReservationUrl({ soin = "", cabine = "", format = "", need = "", source = "", note = "" } = {}) {
  const params = new URLSearchParams();
  if (soin) params.set("soin", soin);
  if (cabine) params.set("cabine", cabine);
  if (format) params.set("format", format);
  if (need) params.set("need", need);
  if (source) params.set("source", source);
  if (note) params.set("note", note);
  const search = params.toString();
  return search ? `reservation.html?${search}` : "reservation.html";
}

function enhanceMenuLinks() {
  document.querySelectorAll(".menu a").forEach((link) => {
    if (link.dataset.menuEnhanced === "true") return;
    const href = String(link.getAttribute("href") || "").split("#")[0];
    const note = menuNotesByHref[href];
    if (!note) return;
    const label = link.textContent.trim();
    clearChildren(link);
    const wrap = document.createElement("span");
    wrap.className = "menu-link-wrap";
    const labelEl = document.createElement("span");
    labelEl.className = "menu-label";
    labelEl.textContent = label;
    const noteEl = document.createElement("span");
    noteEl.className = "menu-note";
    noteEl.textContent = note;
    wrap.appendChild(labelEl);
    wrap.appendChild(noteEl);
    link.appendChild(wrap);
    link.dataset.menuEnhanced = "true";
  });
}

function getCareCategoryMeta(card) {
  const sectionId = card.closest("section")?.id || "";
  if (sectionId === "visage") return { label: "Visage", icon: "drop" };
  if (sectionId === "spa") return { label: "Solo / duo", icon: "users" };
  if (sectionId === "rituels") return { label: "Rituel", icon: "spark" };
  if (sectionId === "accessoires") return { label: "Chaleur", icon: "spark" };
  return { label: "Corps", icon: "body" };
}

function decorateCareCards() {
  const cards = document.querySelectorAll(
    "#massages .price-card, #accessoires .price-card, #rituels .price-card, #visage .price-card, #spa .price-card"
  );
  if (cards.length === 0) return;

  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim() || "";
    const metaText = card.querySelector(".small")?.textContent.trim() || "";
    const smallEl = card.querySelector(".small");
    if (smallEl && !card.querySelector(".care-meta")) {
      const [duration = "", price = ""] = metaText.split(" - ").map((part) => part.trim());
      const categoryMeta = getCareCategoryMeta(card);
      const metaWrap = document.createElement("div");
      metaWrap.className = "care-meta";

      [
        { text: duration, icon: "time" },
        { text: price, icon: "price" },
        { text: categoryMeta.label, icon: categoryMeta.icon }
      ]
        .filter((item) => item.text)
        .forEach((item) => {
          const pill = document.createElement("span");
          pill.className = "meta-pill";
          pill.dataset.icon = item.icon;
          pill.textContent = item.text;
          metaWrap.appendChild(pill);
        });

      smallEl.replaceWith(metaWrap);
    }

    if (!card.querySelector(".choice-tags") && careTagMap[title]) {
      const tagsWrap = document.createElement("div");
      tagsWrap.className = "choice-tags";
      careTagMap[title].forEach((tag) => {
        const chip = document.createElement("span");
        chip.textContent = tag;
        tagsWrap.appendChild(chip);
      });
      const anchor = card.querySelector(".small-note, .cta.small-cta, .text-link");
      if (anchor) {
        card.insertBefore(tagsWrap, anchor);
      } else {
        card.appendChild(tagsWrap);
      }
    }
  });
}

function enhanceBookingLinks() {
  const pageSource = (window.location.pathname.split("/").pop() || "site").replace(".html", "");
  document.querySelectorAll("main a[href^='reservation.html'], .hero-content a[href^='reservation.html']").forEach((link) => {
    const rawHref = link.getAttribute("href");
    if (!rawHref) return;
    const [path, rawSearch = ""] = rawHref.split("?");
    if (path !== "reservation.html") return;

    const params = new URLSearchParams(rawSearch);
    if (!params.get("source")) {
      const sectionId = link.closest("section")?.id || pageSource;
      params.set("source", sectionId);
    }

    const article = link.closest("article");
    if (!params.get("format") && article && /duo/i.test(article.textContent || "")) {
      params.set("format", "Duo");
    }

    if (!params.get("note")) {
      const firstTag = article?.querySelector(".choice-tags span");
      if (firstTag) params.set("note", firstTag.textContent.trim());
    }

    const search = params.toString();
    link.setAttribute("href", search ? `${path}?${search}` : path);
  });
}

function renderNeedRecommendations(needKey) {
  const root = document.querySelector("[data-need-configurator]");
  const results = root ? root.querySelector("[data-need-results]") : null;
  if (!root || !results) return;

  const config = needRecommendationMap[needKey] || needRecommendationMap["mieux-dormir"];
  clearChildren(results);

  const intro = document.createElement("p");
  intro.className = "small-note";
  intro.textContent = config.intro;
  results.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "configurator-grid";

  config.items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "configurator-card";

    const title = document.createElement("h3");
    title.textContent = item.title;
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "care-meta";
    [
      { text: item.duration, icon: "time" },
      { text: item.price, icon: "price" },
      { text: item.soin ? "Soin recommande" : "Format duo", icon: item.soin ? "body" : "users" }
    ].forEach((entry) => {
      const pill = document.createElement("span");
      pill.className = "meta-pill";
      pill.dataset.icon = entry.icon;
      pill.textContent = entry.text;
      meta.appendChild(pill);
    });
    card.appendChild(meta);

    const reason = document.createElement("p");
    reason.textContent = item.reason;
    card.appendChild(reason);

    const tags = document.createElement("div");
    tags.className = "choice-tags";
    item.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.textContent = tag;
      tags.appendChild(chip);
    });
    card.appendChild(tags);

    const cta = document.createElement("a");
    cta.className = "cta small-cta";
    cta.href = buildReservationUrl({
      soin: item.soin,
      cabine: item.cabine,
      format: item.format,
      need: needKey,
      source: "configurateur",
      note: item.note || item.tags[0]
    });
    cta.textContent = "Reserver ce soin";
    card.appendChild(cta);

    grid.appendChild(card);
  });

  results.appendChild(grid);
}

function initNeedConfigurator() {
  const root = document.querySelector("[data-need-configurator]");
  if (!root) return;
  const buttons = root.querySelectorAll("[data-need]");
  if (buttons.length === 0) return;

  const activate = (needKey) => {
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.need === needKey);
    });
    renderNeedRecommendations(needKey);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => activate(button.dataset.need || "mieux-dormir"));
  });

  activate(buttons[0].dataset.need || "mieux-dormir");
}

enhanceMenuLinks();

if (revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((el) => observer.observe(el));
}

if (menuToggle && menu) {
  const setMenuState = (isOpen) => {
    menu.classList.toggle("open", isOpen);
    if (menuBackdrop) menuBackdrop.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  };

  setMenuState(false);

  menuToggle.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("open");
    setMenuState(isOpen);
  });

  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", () => setMenuState(false));
  }

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      setMenuState(false);
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
  });
}

function applyLanguage(lang) {
  const dict = i18n[lang] || i18n.fr;
  document.documentElement.lang = lang;
  if (menuToggle) {
    menuToggle.setAttribute("aria-label", lang === "fr" ? "Ouvrir le menu" : "Open menu");
  }
  langButtons.forEach((btn) => {
    btn.setAttribute("aria-label", lang === "fr" ? "Passer en anglais" : "Switch to French");
  });
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  langButtons.forEach((btn) => {
    btn.textContent = lang === "fr" ? "EN" : "FR";
  });
  try {
    localStorage.setItem("letemple_lang", lang);
  } catch {
    // Ignore storage failures (private mode, blocked storage).
  }
  translateWholePage(lang);
  updateReservationCabinHint();
}

function translateString(value, lang) {
  if (!value) return value;
  if (lang === "en") return frToEn[value] || value;
  return enToFr[value] || value;
}

function translateWholePage(lang) {
  if (!document.body) return;
  const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parentTag = node.parentElement ? node.parentElement.tagName : "";
    if (skipTags.has(parentTag)) continue;
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const raw = node.nodeValue;
    const leading = raw.match(/^\s*/)?.[0] || "";
    const trailing = raw.match(/\s*$/)?.[0] || "";
    const core = raw.trim();
    const translated = translateString(core, lang);
    node.nodeValue = `${leading}${translated}${trailing}`;
  });

  document.querySelectorAll("[placeholder]").forEach((el) => {
    const p = el.getAttribute("placeholder");
    el.setAttribute("placeholder", translateString(p, lang));
  });

  if (document.title) {
    document.title = translateString(document.title, lang);
  }
}

if (langButtons.length > 0) {
  let initialLang = "fr";
  try {
    initialLang = localStorage.getItem("letemple_lang") || "fr";
  } catch {
    initialLang = "fr";
  }
  applyLanguage(initialLang);
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      let current = "fr";
      try {
        current = localStorage.getItem("letemple_lang") || "fr";
      } catch {
        current = document.documentElement.lang === "en" ? "en" : "fr";
      }
      const next = current === "fr" ? "en" : "fr";
      applyLanguage(next);
    });
  });
}

function setStatus(form, text, isError = false) {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;
  status.textContent = text;
  status.classList.toggle("error", isError);
}

function formDataAsObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
}

function getStoredValue(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

const LOCAL_KEYS = {
  clientProfiles: "letemple_client_profiles",
  clientSession: "letemple_client_session",
  employeeSession: "letemple_employee_session",
  reservations: "letemple_reservations",
  stockWeeks: "letemple_stock_weeks",
  contacts: "letemple_contact_messages"
};

const CABIN_CAPACITY = {
  Japon: 2,
  Bali: 2,
  Europe: 3,
  Thailande: 2,
  Mauresque: 2
};

// Modifier ici les identifiants et le profil du compte client de test.
const DEMO_CLIENT_PROFILE = {
  email: "test.client@le-temple.fr",
  password: "Test1234!",
  prenom: "Lylian",
  nom: "Lylian Temple",
  mainNeed: "mieux-dormir"
};

// Modifier ici les identifiants du compte employe de test.
const DEMO_EMPLOYEE_PROFILE = {
  email: "employe@le-temple.fr",
  password: "Employe123!"
};

// Modifier ici les reservations simulees affichees cote employe.
function buildSeedReservations() {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const plusDays = (days) => {
    const copy = new Date(base);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().slice(0, 10);
  };

  return [
    {
      id: "auto-1",
      source: "auto",
      origin: "site",
      nom: "Camille Durand",
      email: "camille@example.com",
      soin: "Californien",
      cabine: "Europe",
      format: "Solo",
      date: plusDays(1),
      heure: "10:00",
      commentaire: "Cliente premiere visite",
      createdAt: new Date().toISOString()
    },
    {
      id: "auto-2",
      source: "auto",
      origin: "site",
      nom: "Nora et Mehdi",
      email: "nora@example.com",
      soin: "Rituel Oriental",
      cabine: "Mauresque",
      format: "Duo",
      date: plusDays(2),
      heure: "18:00",
      commentaire: "Reservation duo cadeau",
      createdAt: new Date().toISOString()
    },
    {
      id: "auto-3",
      source: "auto",
      origin: "site",
      nom: "Julien Martin",
      email: "julien@example.com",
      soin: "Shiatsu",
      cabine: "Japon",
      format: "Solo",
      date: plusDays(3),
      heure: "14:00",
      commentaire: "Besoin de recentrage",
      createdAt: new Date().toISOString()
    }
  ];
}

// Modifier ici les donnees de stock semaine par defaut.
function buildSeedStockWeeks() {
  const currentWeek = getWeekKeyFromDate(new Date());
  const nextWeek = shiftWeekKey(currentWeek, 1);

  const createRows = () => [
    { id: "huile-neutre", product: "Huile neutre", initial: 12, used: 4 },
    { id: "serviettes", product: "Serviettes epaisses", initial: 40, used: 12 },
    { id: "pochons", product: "Pochons", initial: 16, used: 5 },
    { id: "bougies", product: "Bougies massage", initial: 14, used: 3 }
  ];

  return {
    [currentWeek]: createRows(),
    [nextWeek]: createRows()
  };
}

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getLocalDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function getStartOfWeek(dateInput) {
  const date = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
}

function getWeekNumber(dateInput) {
  const date = getStartOfWeek(dateInput);
  const yearStart = getStartOfWeek(new Date(date.getFullYear(), 0, 4));
  return Math.round((date - yearStart) / 604800000) + 1;
}

function getWeekKeyFromDate(dateInput) {
  const date = getStartOfWeek(dateInput instanceof Date ? dateInput : getLocalDate(dateInput));
  const week = String(getWeekNumber(date)).padStart(2, "0");
  return `${date.getFullYear()}-W${week}`;
}

function getDateFromWeekKey(weekKey) {
  const match = String(weekKey).match(/^(\d{4})-W(\d{2})$/);
  if (!match) return getStartOfWeek(new Date());
  const year = Number(match[1]);
  const week = Number(match[2]);
  const januaryFourth = new Date(year, 0, 4);
  const start = getStartOfWeek(januaryFourth);
  start.setDate(start.getDate() + (week - 1) * 7);
  return start;
}

function shiftWeekKey(weekKey, delta) {
  const date = getDateFromWeekKey(weekKey);
  date.setDate(date.getDate() + delta * 7);
  return getWeekKeyFromDate(date);
}

function formatWeekLabel(weekKey) {
  const start = getDateFromWeekKey(weekKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const weekNumber = String(weekKey).split("W")[1] || "";
  return `Semaine ${weekNumber} - ${start.toLocaleDateString("fr-FR")} au ${end.toLocaleDateString("fr-FR")}`;
}

function getClientProfiles() {
  return readJsonStorage(LOCAL_KEYS.clientProfiles, []);
}

function saveClientProfiles(profiles) {
  writeJsonStorage(LOCAL_KEYS.clientProfiles, profiles);
}

function getCurrentClient() {
  const sessionEmail = getStoredValue(LOCAL_KEYS.clientSession);
  if (!sessionEmail) return null;
  return getClientProfiles().find((profile) => profile.email === sessionEmail) || null;
}

function setCurrentClient(email) {
  setStoredValue(LOCAL_KEYS.clientSession, email);
}

function clearCurrentClient() {
  try {
    localStorage.removeItem(LOCAL_KEYS.clientSession);
  } catch {
    // ignore storage errors
  }
}

function getEmployeeSession() {
  return getStoredValue(LOCAL_KEYS.employeeSession) === DEMO_EMPLOYEE_PROFILE.email;
}

function setEmployeeSession(active) {
  if (active) {
    setStoredValue(LOCAL_KEYS.employeeSession, DEMO_EMPLOYEE_PROFILE.email);
  } else {
    try {
      localStorage.removeItem(LOCAL_KEYS.employeeSession);
    } catch {
      // ignore storage errors
    }
  }
}

function getReservations() {
  return readJsonStorage(LOCAL_KEYS.reservations, []);
}

function saveReservations(reservations) {
  writeJsonStorage(LOCAL_KEYS.reservations, reservations);
}

function getStockWeeks() {
  return readJsonStorage(LOCAL_KEYS.stockWeeks, {});
}

function saveStockWeeks(stockWeeks) {
  writeJsonStorage(LOCAL_KEYS.stockWeeks, stockWeeks);
}

function ensureWeekStock(weekKey) {
  const stockWeeks = getStockWeeks();
  if (!stockWeeks[weekKey]) {
    stockWeeks[weekKey] = [
      { id: "huile-neutre", product: "Huile neutre", initial: 12, used: 0 },
      { id: "serviettes", product: "Serviettes epaisses", initial: 40, used: 0 },
      { id: "pochons", product: "Pochons", initial: 16, used: 0 },
      { id: "bougies", product: "Bougies massage", initial: 14, used: 0 }
    ];
    saveStockWeeks(stockWeeks);
  }
  return stockWeeks[weekKey];
}

function ensureLocalDemoData() {
  const profiles = getClientProfiles();
  if (!profiles.some((profile) => profile.email === DEMO_CLIENT_PROFILE.email)) {
    profiles.push({ ...DEMO_CLIENT_PROFILE });
    saveClientProfiles(profiles);
  }

  if (getReservations().length === 0) {
    saveReservations(buildSeedReservations());
  }

  const stockWeeks = getStockWeeks();
  if (Object.keys(stockWeeks).length === 0) {
    saveStockWeeks(buildSeedStockWeeks());
  }
}

ensureLocalDemoData();

function getRecommendedCabinForSoin(soin) {
  return soinCabinMap[String(soin || "").trim()] || "";
}

function getReservationLanguage() {
  return document.documentElement.lang === "en" ? "en" : "fr";
}

function getCabinHintText(cabin, lang = getReservationLanguage()) {
  if (!cabin) {
    return lang === "en"
      ? "The cabin can be filled automatically based on the selected treatment."
      : "La cabine peut se remplir automatiquement selon le soin choisi.";
  }
  const displayCabin = lang === "en" ? translateString(cabin, "en") : cabin;
  return lang === "en"
    ? `Suggested cabin: ${displayCabin}. You can change it if you wish.`
    : `Cabine suggeree automatiquement : ${cabin}. Vous pouvez la modifier si vous le souhaitez.`;
}

function updateReservationCabinHint(recommendedCabin = null) {
  const hint = document.querySelector("[data-cabin-hint]");
  const soinSelect = document.querySelector(".api-form[data-endpoint='/api/reservations'] select[name='soin']");
  if (!hint) return;
  const cabin = recommendedCabin === null ? getRecommendedCabinForSoin(soinSelect ? soinSelect.value : "") : recommendedCabin;
  hint.textContent = getCabinHintText(cabin);
}

function syncCabinWithSelectedSoin(force = false) {
  const form = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  if (!form) return;
  const soinSelect = form.querySelector("select[name='soin']");
  const cabinSelect = form.querySelector("select[name='cabine']");
  if (!soinSelect || !cabinSelect) return;

  const recommendedCabin = getRecommendedCabinForSoin(soinSelect.value);
  if (!recommendedCabin) {
    updateReservationCabinHint("");
    return;
  }

  const hasOption = Array.from(cabinSelect.options).some((opt) => opt.value === recommendedCabin || opt.text === recommendedCabin);
  if (hasOption && (force || !cabinSelect.value)) {
    cabinSelect.value = recommendedCabin;
  }

  updateReservationCabinHint(recommendedCabin);
}

function saveClientProfile(profile) {
  const profiles = getClientProfiles();
  const nextProfiles = profiles.filter((item) => item.email !== profile.email);
  nextProfiles.push(profile);
  saveClientProfiles(nextProfiles);
}

function updateClientGreetingInNavigation() {
  const client = getCurrentClient();
  document.querySelectorAll(".menu a[href='connexion.html']").forEach((link) => {
    const labelEl = link.querySelector(".menu-label");
    const noteEl = link.querySelector(".menu-note");
    const label = client ? `Bonjour ${client.prenom}` : "Connexion";
    if (labelEl) {
      labelEl.textContent = label;
    } else {
      link.textContent = label;
    }
    if (noteEl) {
      noteEl.textContent = client ? "Compte client actif" : "Compte et fidelite";
    }
  });
}

function prefillReservationFormFromClient() {
  const client = getCurrentClient();
  const form = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  if (!client || !form) return;
  const nameInput = form.querySelector("input[name='nom']");
  const emailInput = form.querySelector("input[name='email']");
  if (nameInput && !nameInput.value.trim()) nameInput.value = client.nom;
  if (emailInput && !emailInput.value.trim()) emailInput.value = client.email;
}

function handleClientLogin(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "").trim();
  const profile = getClientProfiles().find((item) => item.email === email);
  if (!profile || profile.password !== password) {
    throw new Error("Identifiants client invalides. Utilisez le compte test affiche sur la page.");
  }
  setCurrentClient(profile.email);
  updateClientGreetingInNavigation();
  return profile;
}

function handleClientRegister(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "").trim();
  const nom = String(payload.nom || "").trim();
  const mainNeed = String(payload.mainNeed || "").trim();
  if (!email || !password || !nom || !mainNeed) {
    throw new Error("Tous les champs du compte client sont requis.");
  }
  const profiles = getClientProfiles();
  if (profiles.some((item) => item.email === email)) {
    throw new Error("Un compte existe deja avec cet email.");
  }
  const profile = {
    email,
    password,
    nom,
    prenom: nom.split(/\s+/)[0] || nom,
    mainNeed
  };
  profiles.push(profile);
  saveClientProfiles(profiles);
  setCurrentClient(email);
  updateClientGreetingInNavigation();
  return profile;
}

function handleContactMessage(payload) {
  const contacts = readJsonStorage(LOCAL_KEYS.contacts, []);
  contacts.push({
    id: createId("contact"),
    createdAt: new Date().toISOString(),
    nom: payload.nom || "",
    sujet: payload.sujet || "",
    email: payload.email || "",
    message: payload.message || ""
  });
  writeJsonStorage(LOCAL_KEYS.contacts, contacts);
}

function getReservationUnits(reservation) {
  return String(reservation.format || "").toLowerCase() === "duo" ? 2 : 1;
}

function getReservationSlots() {
  return [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00"
  ];
}

function handleReservationSubmission(payload) {
  const reservations = getReservations();
  const reservation = {
    id: createId("reservation"),
    source: "auto",
    origin: "site",
    nom: String(payload.nom || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    telephone: String(payload.telephone || "").trim(),
    soin: String(payload.soin || "").trim(),
    cabine: String(payload.cabine || "").trim(),
    format: String(payload.format || "").trim() || "Solo",
    date: String(payload.date || "").trim(),
    heure: String(payload.heure || "").trim(),
    commentaire: String(payload.message || "").trim(),
    createdAt: new Date().toISOString()
  };

  if (!reservation.nom || !reservation.email || !reservation.soin || !reservation.cabine || !reservation.date || !reservation.heure) {
    throw new Error("Merci de completer nom, email, soin, cabine, date et heure.");
  }

  reservations.push(reservation);
  saveReservations(reservations);
  return reservation;
}

function handleLocalFormSubmit(form, payload) {
  const endpoint = form.dataset.endpoint;
  if (endpoint === "/api/auth/login") {
    const profile = handleClientLogin(payload);
    return {
      message: `Connexion reussie. Bonjour ${profile.prenom}.`,
      onSuccess() {
        renderPersonalizedFaq();
        setTimeout(() => {
          window.location.href = "soins.html#faq-conseils";
        }, 500);
      }
    };
  }

  if (endpoint === "/api/auth/register") {
    const profile = handleClientRegister(payload);
    return {
      message: `Compte cree. Bonjour ${profile.prenom}.`,
      onSuccess() {
        renderPersonalizedFaq();
        setTimeout(() => {
          window.location.href = "soins.html#faq-conseils";
        }, 500);
      }
    };
  }

  if (endpoint === "/api/contacts") {
    handleContactMessage(payload);
    return { message: "Message enregistre. Nous vous recontactons rapidement." };
  }

  if (endpoint === "/api/reservations") {
    const reservation = handleReservationSubmission(payload);
    return {
      message: `Reservation enregistree pour ${reservation.nom} le ${reservation.date} a ${reservation.heure}.`,
      onSuccess() {
        refreshAvailability();
        prefillReservationFormFromClient();
      }
    };
  }

  throw new Error("Formulaire non pris en charge dans la demo locale.");
}

function initApiForms() {
  document.querySelectorAll(".api-form").forEach((form) => {
    if (form.dataset.localBound === "true") return;
    form.dataset.localBound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitButton = form.querySelector("button[type='submit']");
      if (submitButton) submitButton.disabled = true;
      setStatus(form, "Envoi en cours...");
      try {
        const payload = formDataAsObject(form);
        const result = handleLocalFormSubmit(form, payload);
        setStatus(form, result.message || "Envoye.");
        const endpoint = form.dataset.endpoint || "";
        if (!endpoint.includes("/auth/login")) form.reset();
        if (typeof result.onSuccess === "function") result.onSuccess();
      } catch (error) {
        setStatus(form, error.message, true);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
}

function refreshAvailability() {
  const dateInput = document.querySelector("input[name='date']");
  const cabinSelect = document.querySelector("#cabineSelect");
  const timeSelect = document.querySelector("#heureSelect");
  const availabilityRoot = document.querySelector("[data-availability]");
  const form = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  if (!dateInput || !cabinSelect || !timeSelect || !availabilityRoot || !form) return;

  const selectedDate = dateInput.value;
  const selectedCabin = cabinSelect.value;
  if (!selectedDate) {
    timeSelect.innerHTML = "<option value=''>Choisir d'abord une date</option>";
    availabilityRoot.innerHTML = "<p class='small-note'>Selectionnez une date pour voir les creneaux de 10h a 22h.</p>";
    return;
  }
  if (!selectedCabin) {
    timeSelect.innerHTML = "<option value=''>Choisir d'abord une cabine</option>";
    availabilityRoot.innerHTML = "<p class='small-note'>Selectionnez une cabine pour afficher les places restantes.</p>";
    return;
  }

  const reservations = getReservations().filter((item) => item.date === selectedDate && item.cabine === selectedCabin);
  const max = CABIN_CAPACITY[selectedCabin] || 2;
  const slots = getReservationSlots().map((time) => {
    const reserved = reservations
      .filter((item) => item.heure === time)
      .reduce((total, item) => total + getReservationUnits(item), 0);
    return {
      time,
      max,
      reserved,
      remaining: Math.max(max - reserved, 0)
    };
  });

  timeSelect.innerHTML = "<option value=''>Choisir un creneau</option>";
  clearChildren(availabilityRoot);

  const title = document.createElement("h3");
  title.textContent = `Creneaux restants - ${selectedCabin}`;
  availabilityRoot.appendChild(title);

  const list = document.createElement("div");
  list.className = "slot-grid";

  slots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot.time;
    option.textContent = `${slot.time} (${slot.remaining} restantes)`;
    option.disabled = slot.remaining <= 0;
    timeSelect.appendChild(option);

    const chip = document.createElement("span");
    chip.className = `slot ${slot.remaining <= 0 ? "full" : "open"}`;
    chip.textContent = `${slot.time} - ${slot.remaining}/${slot.max}`;
    list.appendChild(chip);
  });

  availabilityRoot.appendChild(list);
}

function initReservationDate() {
  const reservationDateInput = document.querySelector("input[name='date']");
  if (!reservationDateInput) return;
  const cabinSelect = document.querySelector("#cabineSelect");
  const today = new Date().toISOString().slice(0, 10);
  reservationDateInput.min = today;
  if (!reservationDateInput.value) reservationDateInput.value = today;
  reservationDateInput.addEventListener("change", refreshAvailability);
  reservationDateInput.addEventListener("input", refreshAvailability);
  if (cabinSelect) cabinSelect.addEventListener("change", refreshAvailability);
  refreshAvailability();
}

function loadCatalogOptions() {
  // Les options sont deja presentes en dur dans le HTML pour cette demo locale.
}

function applyReservationPrefillFromQuery() {
  const form = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const soin = params.get("soin");
  const cabine = params.get("cabine");
  const format = params.get("format");
  const need = params.get("need");
  const note = params.get("note");
  const source = params.get("source");

  if (soin) {
    const soinSelect = form.querySelector("select[name='soin']");
    if (soinSelect) {
      const exists = Array.from(soinSelect.options).some((opt) => opt.value === soin || opt.text === soin);
      if (exists) soinSelect.value = soin;
    }
  }

  if (cabine) {
    const cabinSelect = form.querySelector("select[name='cabine']");
    if (cabinSelect) {
      const exists = Array.from(cabinSelect.options).some((opt) => opt.value === cabine || opt.text === cabine);
      if (exists) cabinSelect.value = cabine;
    }
  }

  if (format) {
    const formatSelect = form.querySelector("select[name='format']");
    if (formatSelect) {
      const exists = Array.from(formatSelect.options).some((opt) => opt.value === format || opt.text === format);
      if (exists) formatSelect.value = format;
    }
  }

  const message = form.querySelector("textarea[name='message']");
  if (message && !message.value.trim()) {
    const fragments = [];
    if (cabine) fragments.push(`Cabine souhaitee: ${cabine}`);
    if (need) fragments.push(`Besoin du moment: ${humanizeNeed(need)}`);
    if (note) fragments.push(note);
    if (source) fragments.push(`Source: ${source.replace(/-/g, " ")}`);
    if (fragments.length > 0) {
      message.value = fragments.join(" | ");
    }
  }

  const context = document.querySelector("[data-reservation-context]");
  if (context) {
    const summaryBits = [];
    if (soin) summaryBits.push(soin);
    if (cabine) summaryBits.push(`cabine ${cabine}`);
    if (format) summaryBits.push(`format ${format}`);
    if (need) summaryBits.push(`besoin ${humanizeNeed(need)}`);
    if (summaryBits.length > 0) {
      context.hidden = false;
      context.textContent = `Votre demande est deja pre-remplie: ${summaryBits.join(" - ")}. Ajustez librement si besoin.`;
    } else {
      context.hidden = true;
    }
  }

  if (soin || cabine || format || need) {
    refreshAvailability();
  }
}

function initReservationPage() {
  loadCatalogOptions();
  applyReservationPrefillFromQuery();
  const reservationForm = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  const soinSelect = reservationForm ? reservationForm.querySelector("select[name='soin']") : null;
  if (soinSelect) {
    soinSelect.addEventListener("change", () => {
      syncCabinWithSelectedSoin(true);
      refreshAvailability();
    });
  }
  prefillReservationFormFromClient();
  syncCabinWithSelectedSoin(false);
  initReservationDate();
}

function buildFaqItems() {
  return [
    {
      question: "Quel soin choisir si je veux mieux dormir ?",
      answer: "Si votre besoin principal est de faire redescendre la charge mentale, nous vous orientons plutot vers des soins enveloppants et lents.",
      links: [
        { label: "Californien", href: "#soin-californien" },
        { label: "Abhyanga", href: "#soin-abhyanga" },
        { label: "Rituel Ayurvedique", href: "#soin-rituel-ayurvedique" }
      ]
    },
    {
      question: "J'ai des douleurs ou des tensions dans le dos, la nuque ou les jambes.",
      answer: "Dans ce cas, les soins les plus structures ou profonds sont souvent les plus adaptes, surtout si la tension est deja installee.",
      links: [
        { label: "Shiatsu", href: "#soin-shiatsu" },
        { label: "Suedois", href: "#massages" },
        { label: "Massage aux bambous", href: "#accessoires" }
      ]
    },
    {
      question: "Je veux surtout lacher prise sans reflechir longtemps.",
      answer: "Si vous cherchez une sensation de refuge immediate, misez sur les soins tres enveloppants ou les rituels longs.",
      links: [
        { label: "Mauresque", href: "#soin-mauresque" },
        { label: "Rituel Oriental", href: "#soin-rituel-oriental" },
        { label: "Spa privatif", href: "#spa" }
      ]
    },
    {
      question: "Quel soin choisir pour une premiere visite ?",
      answer: "Nous recommandons un format simple, lisible et rassurant, avec une pression modulable et une ambiance douce.",
      links: [
        { label: "Californien", href: "#soin-californien" },
        { label: "Hydratant visage", href: "#soin-hydratant" },
        { label: "Abhyanga", href: "#soin-abhyanga" }
      ]
    },
    {
      question: "Je veux un soin visage qui se sente vraiment utile.",
      answer: "Selon que vous cherchiez de l'eclat, du confort ou un effet plus tonique, nous ne proposons pas les memes options.",
      links: [
        { label: "Hydratant", href: "#soin-hydratant" },
        { label: "Purifiant", href: "#visage" },
        { label: "Kobido", href: "#soin-kobido" }
      ]
    },
    {
      question: "Je veux reserver a deux ou offrir un soin.",
      answer: "Les formats duo et les rituels longs sont les plus lisibles pour vivre ou offrir une vraie parenthese ensemble.",
      links: [
        { label: "Rituel Oriental", href: "#soin-rituel-oriental" },
        { label: "Spa privatif", href: "#spa" },
        { label: "Rituel Balinais", href: "#rituels" }
      ]
    }
  ];
}

function renderPersonalizedFaq() {
  const root = document.querySelector("[data-personalized-faq]");
  if (!root) return;
  clearChildren(root);

  const client = getCurrentClient();
  if (!client) {
    const locked = document.createElement("div");
    locked.className = "faq-locked panel";
    const message = document.createElement("p");
    message.textContent = "Connectez-vous ou creez un compte pour recevoir des conseils personnalises.";
    locked.appendChild(message);
    const actions = document.createElement("div");
    actions.className = "section-actions";
    const loginLink = document.createElement("a");
    loginLink.className = "cta small-cta";
    loginLink.href = "connexion.html";
    loginLink.textContent = "Me connecter";
    const registerLink = document.createElement("a");
    registerLink.className = "text-link";
    registerLink.href = "connexion.html#register-account";
    registerLink.textContent = "Creer un compte";
    actions.appendChild(loginLink);
    actions.appendChild(registerLink);
    locked.appendChild(actions);
    root.appendChild(locked);
    return;
  }

  const recommendationBox = document.createElement("div");
  recommendationBox.className = "recommendation-hero";
  const title = document.createElement("h3");
  title.textContent = `Bonjour ${client.prenom}, voici les soins que nous vous recommandons aujourd'hui`;
  const description = document.createElement("p");
  description.textContent = `Besoin principal enregistre dans votre profil : ${humanizeNeed(client.mainNeed)}.`;
  recommendationBox.appendChild(title);
  recommendationBox.appendChild(description);

  const cards = document.createElement("div");
  cards.className = "configurator-grid";
  const recommendations = (needRecommendationMap[client.mainNeed] || needRecommendationMap["mieux-dormir"]).items.slice(0, 3);
  recommendations.forEach((item) => {
    const card = document.createElement("article");
    card.className = "configurator-card";
    const cardTitle = document.createElement("h3");
    cardTitle.textContent = item.title;
    const reason = document.createElement("p");
    reason.textContent = item.reason;
    const actions = document.createElement("div");
    actions.className = "section-actions";
    const details = document.createElement("a");
    details.className = "text-link";
    details.href = item.soin
      ? `#soin-${item.soin.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`
      : "#spa";
    details.textContent = "Voir ce soin";
    const book = document.createElement("a");
    book.className = "cta small-cta";
    book.href = buildReservationUrl({
      soin: item.soin,
      cabine: item.cabine,
      format: item.format,
      need: client.mainNeed,
      source: "faq-personnalisee",
      note: item.tags[0]
    });
    book.textContent = "Reserver";
    actions.appendChild(details);
    actions.appendChild(book);
    card.appendChild(cardTitle);
    card.appendChild(reason);
    card.appendChild(actions);
    cards.appendChild(card);
  });
  recommendationBox.appendChild(cards);
  root.appendChild(recommendationBox);

  const accordionStack = document.createElement("div");
  accordionStack.className = "accordion-stack";

  buildFaqItems().forEach((item, index) => {
    const detail = document.createElement("details");
    detail.className = "faq-accordion";
    if (index === 0) detail.open = true;

    const summary = document.createElement("summary");
    summary.textContent = item.question;
    detail.appendChild(summary);

    const body = document.createElement("div");
    body.className = "accordion-body";
    const text = document.createElement("p");
    text.textContent = item.answer;
    body.appendChild(text);

    const links = document.createElement("div");
    links.className = "section-actions";
    item.links.forEach((linkData) => {
      const anchor = document.createElement("a");
      anchor.className = "text-link";
      anchor.href = linkData.href;
      anchor.textContent = `Voir ce soin : ${linkData.label}`;
      links.appendChild(anchor);
    });
    body.appendChild(links);
    detail.appendChild(body);
    accordionStack.appendChild(detail);
  });

  root.appendChild(accordionStack);
}

initApiForms();
initReservationPage();
decorateCareCards();
initNeedConfigurator();
enhanceBookingLinks();
updateClientGreetingInNavigation();
renderPersonalizedFaq();

function renderGameProfile(profile) {
  const pointsEl = document.querySelector("#gamePoints");
  const lastSpinEl = document.querySelector("#gameLastSpin");
  const historyEl = document.querySelector("#gameHistory");
  if (!pointsEl || !lastSpinEl || !historyEl) return;

  pointsEl.textContent = String(profile.points || 0);
  lastSpinEl.textContent = profile.lastSpinDate || "Aucun tirage";
  historyEl.innerHTML = "";

  const history = Array.isArray(profile.history) ? profile.history : [];
  if (history.length === 0) {
    historyEl.innerHTML = "<li><span>Aucune partie pour le moment</span><strong>-</strong></li>";
    return;
  }

  history.slice(0, 8).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${new Date(item.date).toLocaleDateString("fr-FR")} - ${item.reward}</span><strong>+${item.points}</strong>`;
    historyEl.appendChild(li);
  });
}

async function initGameSystem() {
  const emailInput = document.querySelector("#gameEmail");
  const loadBtn = document.querySelector("#gameLoadBtn");
  const spinBtn = document.querySelector("#gameSpinBtn");
  const status = document.querySelector("#gameStatus");
  if (!emailInput || !loadBtn || !spinBtn || !status) return;

  const setGameStatus = (text, error = false) => {
    status.textContent = text;
    status.classList.toggle("error", error);
  };

  async function loadProfile() {
    const email = emailInput.value.trim().toLowerCase();
    if (!email) {
      setGameStatus("Entrez votre email pour charger votre profil.", true);
      return null;
    }
    const res = await fetch(`/api/game/profile?email=${encodeURIComponent(email)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Impossible de charger le profil.");
    renderGameProfile(data.profile);
    setGameStatus("Profil charge.");
    return data.profile;
  }

  loadBtn.addEventListener("click", async () => {
    try {
      await loadProfile();
    } catch (error) {
      setGameStatus(error.message, true);
    }
  });

  spinBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    if (!email) {
      setGameStatus("Entrez votre email avant de lancer le tirage.", true);
      return;
    }
    setGameStatus("Tirage en cours...");
    try {
      const res = await fetch("/api/game/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        renderGameProfile(data.profile || { points: 0, lastSpinDate: "", history: [] });
        throw new Error(data.error || "Tirage impossible.");
      }
      renderGameProfile(data.profile);
      setGameStatus(data.message || "Tirage valide.");
    } catch (error) {
      setGameStatus(error.message, true);
    }
  });
}

initGameSystem();

function renderFooterYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll(".footer p").forEach((p) => {
    p.textContent = p.textContent.replace(/\b20\d{2}\b/g, String(year));
  });
}

renderFooterYear();

function initEmployeeArea() {
  const loginForm = document.querySelector("#employeeLoginForm");
  if (!loginForm) return;

  const loginBox = document.querySelector("#employeeLoginBox");
  const emailInput = document.querySelector("#employeeEmail");
  const passwordInput = document.querySelector("#employeePassword");
  const statusEl = document.querySelector("#employeeStatus");
  const appSection = document.querySelector("#employeeApp");
  const logoutBtn = document.querySelector("#employeeLogoutBtn");
  const welcomeEl = document.querySelector("#employeeWelcome");
  const sessionMetaEl = document.querySelector("#employeeSessionMeta");
  const scheduleBody = document.querySelector("#employeeScheduleTable tbody");
  const autoReservationsList = document.querySelector("#autoReservationsList");
  const manualReservationsList = document.querySelector("#manualReservationsList");
  const manualReservationForm = document.querySelector("#manualReservationForm");
  const manualReservationStatus = document.querySelector("#manualReservationStatus");
  const stockWeekTableBody = document.querySelector("#stockWeekTable tbody");
  const stocksStatus = document.querySelector("#stocksStatus");
  const planningWeekLabel = document.querySelector("#planningWeekLabel");
  const stockWeekLabel = document.querySelector("#stockWeekLabel");
  const planningPrevWeekBtn = document.querySelector("#planningPrevWeekBtn");
  const planningNextWeekBtn = document.querySelector("#planningNextWeekBtn");
  const stockPrevWeekBtn = document.querySelector("#stockPrevWeekBtn");
  const stockNextWeekBtn = document.querySelector("#stockNextWeekBtn");
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  let planningWeekKey = getWeekKeyFromDate(new Date());
  let stockWeekKey = getWeekKeyFromDate(new Date());

  function setEmployeeStatus(text, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("error", isError);
  }

  function setEmployeeVisible(visible) {
    if (loginBox) loginBox.hidden = visible;
    if (appSection) appSection.hidden = !visible;
  }

  function sortReservations(rows) {
    return [...rows].sort((left, right) => {
      const leftValue = `${left.date} ${left.heure}`;
      const rightValue = `${right.date} ${right.heure}`;
      return leftValue.localeCompare(rightValue);
    });
  }

  function getReservationsForWeek(weekKey) {
    return sortReservations(getReservations().filter((item) => getWeekKeyFromDate(item.date) === weekKey));
  }

  function getSourceLabel(item) {
    return item.source === "manual" ? "Manuelle" : "Auto";
  }

  function renderReservationStream(target, rows) {
    if (!target) return;
    clearChildren(target);
    if (rows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "small-note";
      empty.textContent = "Aucune reservation sur cette semaine.";
      target.appendChild(empty);
      return;
    }
    rows.forEach((item) => {
      const card = document.createElement("article");
      card.className = `reservation-card ${item.source === "manual" ? "manual" : "auto"}`;

      const head = document.createElement("div");
      head.className = "reservation-card-head";
      const title = document.createElement("strong");
      title.textContent = `${item.nom} - ${item.soin}`;
      const badge = document.createElement("span");
      badge.className = `source-badge ${item.source === "manual" ? "manual" : "auto"}`;
      badge.textContent = getSourceLabel(item);
      head.appendChild(title);
      head.appendChild(badge);

      const meta = document.createElement("p");
      meta.className = "small-note";
      meta.textContent = `${new Date(item.date).toLocaleDateString("fr-FR")} a ${item.heure} - cabine ${item.cabine}`;

      card.appendChild(head);
      card.appendChild(meta);

      if (item.commentaire) {
        const note = document.createElement("p");
        note.textContent = item.commentaire;
        card.appendChild(note);
      }

      target.appendChild(card);
    });
  }

  function renderSchedule() {
    if (!scheduleBody) return;
    clearChildren(scheduleBody);
    const rows = getReservationsForWeek(planningWeekKey);
    rows.forEach((item) => {
      const tr = document.createElement("tr");
      const cells = [
        new Date(item.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" }),
        item.heure,
        item.nom,
        item.soin,
        item.cabine,
        getSourceLabel(item)
      ];
      cells.forEach((value, index) => {
        const td = document.createElement("td");
        if (index === 5) {
          const badge = document.createElement("span");
          badge.className = `source-badge ${item.source === "manual" ? "manual" : "auto"}`;
          badge.textContent = value;
          td.appendChild(badge);
        } else {
          td.textContent = value;
        }
        tr.appendChild(td);
      });
      scheduleBody.appendChild(tr);
    });
    renderReservationStream(autoReservationsList, rows.filter((item) => item.source !== "manual"));
    renderReservationStream(manualReservationsList, rows.filter((item) => item.source === "manual"));
    if (planningWeekLabel) planningWeekLabel.textContent = formatWeekLabel(planningWeekKey);
  }

  function renderStockWeek() {
    if (!stockWeekTableBody) return;
    const rows = ensureWeekStock(stockWeekKey);
    clearChildren(stockWeekTableBody);

    rows.forEach((row) => {
      const tr = document.createElement("tr");

      const productCell = document.createElement("td");
      productCell.textContent = row.product;
      tr.appendChild(productCell);

      ["initial", "used"].forEach((field) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "1";
        input.value = String(row[field] || 0);
        input.dataset.stockWeek = stockWeekKey;
        input.dataset.stockId = row.id;
        input.dataset.stockField = field;
        input.className = "stock-input";
        td.appendChild(input);
        tr.appendChild(td);
      });

      const remainingCell = document.createElement("td");
      remainingCell.textContent = String(Math.max((row.initial || 0) - (row.used || 0), 0));
      tr.appendChild(remainingCell);

      stockWeekTableBody.appendChild(tr);
    });

    stockWeekTableBody.querySelectorAll(".stock-input").forEach((input) => {
      input.addEventListener("input", () => {
        const value = Math.max(Number(input.value) || 0, 0);
        const stockWeeks = getStockWeeks();
        const weekRows = stockWeeks[input.dataset.stockWeek] || [];
        const currentRow = weekRows.find((row) => row.id === input.dataset.stockId);
        if (!currentRow) return;
        currentRow[input.dataset.stockField] = value;
        stockWeeks[input.dataset.stockWeek] = weekRows;
        saveStockWeeks(stockWeeks);
        renderStockWeek();
        if (stocksStatus) {
          stocksStatus.textContent = "Stock semaine mis a jour.";
          stocksStatus.classList.remove("error");
        }
      });
    });

    if (stockWeekLabel) stockWeekLabel.textContent = formatWeekLabel(stockWeekKey);
  }

  function switchTab(tabName) {
    tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tabTarget === tabName);
    });
    tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tabPanel !== tabName;
    });
  }

  function openEmployeeSession() {
    setEmployeeVisible(true);
    if (welcomeEl) welcomeEl.textContent = "Bonjour equipe Temple";
    if (sessionMetaEl) sessionMetaEl.textContent = "Planning de la semaine, reservations auto/manuelles et stock editable.";
    renderSchedule();
    renderStockWeek();
    switchTab("planning");
    setEmployeeStatus("Connexion employee reussie.");
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = String(emailInput ? emailInput.value : "").trim().toLowerCase();
    const password = String(passwordInput ? passwordInput.value : "").trim();
    if (email !== DEMO_EMPLOYEE_PROFILE.email || password !== DEMO_EMPLOYEE_PROFILE.password) {
      setEmployeeStatus("Identifiants employe invalides. Utilisez le compte test affiche.", true);
      return;
    }
    setEmployeeSession(true);
    openEmployeeSession();
  });

  if (manualReservationForm) {
    manualReservationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = formDataAsObject(manualReservationForm);
      const reservation = {
        id: createId("manual"),
        source: "manual",
        origin: "employee",
        nom: String(payload.nom || "").trim(),
        soin: String(payload.soin || "").trim(),
        date: String(payload.date || "").trim(),
        heure: String(payload.heure || "").trim(),
        cabine: String(payload.cabine || "").trim(),
        commentaire: String(payload.commentaire || "").trim(),
        createdAt: new Date().toISOString()
      };
      if (!reservation.nom || !reservation.soin || !reservation.date || !reservation.heure || !reservation.cabine) {
        if (manualReservationStatus) {
          manualReservationStatus.textContent = "Merci de completer tous les champs de reservation manuelle.";
          manualReservationStatus.classList.add("error");
        }
        return;
      }
      const reservations = getReservations();
      reservations.push(reservation);
      saveReservations(reservations);
      manualReservationForm.reset();
      if (manualReservationStatus) {
        manualReservationStatus.textContent = "Reservation manuelle ajoutee au planning.";
        manualReservationStatus.classList.remove("error");
      }
      planningWeekKey = getWeekKeyFromDate(reservation.date);
      renderSchedule();
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tabTarget || "planning"));
  });

  if (planningPrevWeekBtn) {
    planningPrevWeekBtn.addEventListener("click", () => {
      planningWeekKey = shiftWeekKey(planningWeekKey, -1);
      renderSchedule();
    });
  }
  if (planningNextWeekBtn) {
    planningNextWeekBtn.addEventListener("click", () => {
      planningWeekKey = shiftWeekKey(planningWeekKey, 1);
      renderSchedule();
    });
  }
  if (stockPrevWeekBtn) {
    stockPrevWeekBtn.addEventListener("click", () => {
      stockWeekKey = shiftWeekKey(stockWeekKey, -1);
      renderStockWeek();
    });
  }
  if (stockNextWeekBtn) {
    stockNextWeekBtn.addEventListener("click", () => {
      stockWeekKey = shiftWeekKey(stockWeekKey, 1);
      renderStockWeek();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setEmployeeSession(false);
      setEmployeeVisible(false);
      setEmployeeStatus("Deconnecte.");
    });
  }

  if (getEmployeeSession()) {
    openEmployeeSession();
  } else {
    setEmployeeVisible(false);
    setEmployeeStatus("Acces reserve aux employes.");
  }
}

initEmployeeArea();
