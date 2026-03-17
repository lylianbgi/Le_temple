const revealElements = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const menuBackdrop = document.querySelector(".menu-backdrop");
const langButtons = document.querySelectorAll("[data-lang-toggle]");
document.documentElement.classList.add("js");

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

async function postJson(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

document.querySelectorAll(".api-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = form.dataset.endpoint;
    if (!endpoint) return;
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    setStatus(form, "Envoi en cours...");
    try {
      const payload = formDataAsObject(form);
      const data = await postJson(endpoint, payload);
      setStatus(form, data.message || "Envoye.");
      if (!endpoint.includes("/auth/login")) form.reset();
      if (endpoint.includes("/auth/login") && data.token) {
        setStoredValue("letemple_token", data.token);
        setStoredValue("letemple_user", data.nom || "");
      }
    } catch (error) {
      setStatus(form, error.message, true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});

async function refreshAvailability() {
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

  availabilityRoot.textContent = "Chargement des creneaux...";
  try {
    const response = await fetch(
      `/api/availability?date=${encodeURIComponent(selectedDate)}&cabine=${encodeURIComponent(selectedCabin)}`
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Impossible de charger les creneaux.");

    timeSelect.innerHTML = "<option value=''>Choisir un creneau</option>";
    availabilityRoot.innerHTML = `<h3>Creneaux restants - ${selectedCabin}</h3>`;

    const list = document.createElement("div");
    list.className = "slot-grid";

    data.slots.forEach((slot) => {
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
  } catch (error) {
    timeSelect.innerHTML = "<option value=''>Creneaux indisponibles</option>";
    availabilityRoot.innerHTML =
      "<p class='form-status error'>Impossible de charger les creneaux. Verifiez que le site est lance via <strong>npm start</strong>.</p>";
  }
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

async function loadCatalogOptions() {
  const soinSelect = document.querySelector("select[name='soin']");
  const cabinSelect = document.querySelector("select[name='cabine']");
  if (!soinSelect || !cabinSelect) return;
  try {
    const res = await fetch("/api/meta/catalog");
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return;
    const currentSoin = soinSelect.value;
    const currentCabin = cabinSelect.value;
    soinSelect.innerHTML = "<option value=''>Choisir un soin</option>";
    cabinSelect.innerHTML = "<option value=''>Choisir une cabine</option>";
    data.soins.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      soinSelect.appendChild(opt);
    });
    data.cabins.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      cabinSelect.appendChild(opt);
    });
    if (currentSoin) soinSelect.value = currentSoin;
    if (currentCabin) cabinSelect.value = currentCabin;
  } catch {
    // keep static options fallback
  }
}

function applyReservationPrefillFromQuery() {
  const form = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const soin = params.get("soin");
  const cabine = params.get("cabine");

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
    const message = form.querySelector("textarea[name='message']");
    if (message && !message.value.trim()) {
      message.value = `Cabine souhaitee: ${cabine}`;
    }
  }

  if (soin || cabine) {
    refreshAvailability();
  }
}

async function initReservationPage() {
  await loadCatalogOptions();
  applyReservationPrefillFromQuery();
  const reservationForm = document.querySelector(".api-form[data-endpoint='/api/reservations']");
  const soinSelect = reservationForm ? reservationForm.querySelector("select[name='soin']") : null;
  if (soinSelect) {
    soinSelect.addEventListener("change", () => {
      syncCabinWithSelectedSoin(true);
      refreshAvailability();
    });
  }
  syncCabinWithSelectedSoin(false);
  initReservationDate();
}

initReservationPage();

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

async function initEmployeeArea() {
  const loginForm = document.querySelector("#employeeLoginForm");
  if (!loginForm) return;

  const codeInput = document.querySelector("#employeeCode");
  const statusEl = document.querySelector("#employeeStatus");
  const appSection = document.querySelector("#employeeApp");
  const stockSection = document.querySelector("#employeeStockSection");
  const notesSection = document.querySelector("#employeeNotesSection");
  const planningBody = document.querySelector("#planningTable tbody");
  const demandesBody = document.querySelector("#demandesTable tbody");
  const stocksBody = document.querySelector("#stocksTable tbody");
  const stocksStatus = document.querySelector("#stocksStatus");
  const stockAddForm = document.querySelector("#stockAddForm");
  const stockNameInput = document.querySelector("#stockNameInput");
  const stockQtyInput = document.querySelector("#stockQtyInput");
  const stockUnitInput = document.querySelector("#stockUnitInput");
  const notesList = document.querySelector("#planningNotesList");
  const noteForm = document.querySelector("#planningNoteForm");
  const noteInput = document.querySelector("#planningNoteInput");
  const logoutBtn = document.querySelector("#employeeLogoutBtn");

  let employeeActive = false;
  const EMPLOYEE_IDLE_MS = 5 * 60 * 1000;
  let idleTimer = null;

  function setEmployeeStatus(text, error = false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("error", error);
  }

  function setEmployeeVisible(visible) {
    if (appSection) appSection.hidden = !visible;
    if (stockSection) stockSection.hidden = !visible;
    if (notesSection) notesSection.hidden = !visible;
  }

  function clearEmployeeSession(message) {
    employeeActive = false;
    setEmployeeVisible(false);
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (message) setEmployeeStatus(message, true);
  }

  function resetIdleTimer() {
    if (!employeeActive) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      clearEmployeeSession("Session expiree (inactivite).");
      fetch("/api/employee/logout", {
        method: "POST"
      }).catch(() => {});
    }, EMPLOYEE_IDLE_MS);
  }

  function bindIdleWatchers() {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
  }

  async function apiEmployee(path, options = {}) {
    const response = await fetch(path, { ...options });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearEmployeeSession("Session employee invalide.");
    }
    if (!response.ok) throw new Error(data.error || "Erreur employee");
    resetIdleTimer();
    return data;
  }

  function renderPlanning(rows) {
    if (!planningBody) return;
    planningBody.innerHTML = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${row.date}</td><td>${row.heure}</td><td>${row.total}</td><td>${row.details.map((d) => `${d.nom} (${d.cabine})`).join(", ")}</td>`;
      planningBody.appendChild(tr);
    });
  }

  function renderDemandes(rows) {
    if (!demandesBody) return;
    demandesBody.innerHTML = "";
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${new Date(r.createdAt).toLocaleDateString("fr-FR")}</td><td>${r.nom}</td><td>${r.sujet}</td><td>${r.message}</td>`;
      demandesBody.appendChild(tr);
    });
  }

  function renderStocks(rows) {
    if (!stocksBody) return;
    stocksBody.innerHTML = "";
    rows.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.name}</td><td><input type="number" min="0" step="1" value="${s.qty}" data-stock-id="${s.id}" style="width:90px"></td><td>${s.unit}</td><td><div style="display:flex;gap:0.45rem;flex-wrap:wrap"><button class="cta" type="button" data-stock-save="${s.id}">Save</button><button class="cta danger" type="button" data-stock-delete="${s.id}">Suppr</button></div></td>`;
      stocksBody.appendChild(tr);
    });
    stocksBody.querySelectorAll("input[data-stock-id]").forEach((input) => {
      input.addEventListener("input", () => {
        const value = Number(input.value);
        if (!Number.isFinite(value) || value < 0) input.value = "0";
        if (Number.isFinite(value)) input.value = String(Math.floor(value));
      });
    });
    stocksBody.querySelectorAll("[data-stock-save]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-stock-save");
        const input = stocksBody.querySelector(`[data-stock-id="${id}"]`);
        const qty = Number(input ? input.value : 0);
        try {
          const data = await apiEmployee("/api/employee/stocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, qty })
          });
          renderStocks(data.stocks);
          if (stocksStatus) {
            stocksStatus.textContent = "Stock mis a jour.";
            stocksStatus.classList.remove("error");
          }
        } catch (error) {
          if (stocksStatus) {
            stocksStatus.textContent = error.message;
            stocksStatus.classList.add("error");
          }
        }
      });
    });
    stocksBody.querySelectorAll("[data-stock-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-stock-delete");
        const confirmed = window.confirm("Supprimer ce produit du stock ?");
        if (!confirmed) return;
        try {
          const data = await apiEmployee("/api/employee/stocks/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });
          renderStocks(data.stocks);
          if (stocksStatus) {
            stocksStatus.textContent = "Produit supprime du stock.";
            stocksStatus.classList.remove("error");
          }
        } catch (error) {
          if (stocksStatus) {
            stocksStatus.textContent = error.message;
            stocksStatus.classList.add("error");
          }
        }
      });
    });
  }

  function renderNotes(rows) {
    if (!notesList) return;
    notesList.innerHTML = "";
    rows.forEach((n) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${new Date(n.createdAt).toLocaleString("fr-FR")} - ${n.note}</span><strong></strong>`;
      notesList.appendChild(li);
    });
  }

  async function loadDashboard() {
    const data = await apiEmployee("/api/employee/dashboard");
    renderPlanning(data.planning || []);
    renderDemandes(data.demandes || []);
    renderStocks(data.stocks || []);
    renderNotes(data.notes || []);
  }

  async function login(code) {
    const response = await fetch("/api/employee/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Connexion employee impossible");
    setEmployeeStatus("Connexion validee. Chargement...");
    setEmployeeVisible(false);
    await loadDashboard();
    setEmployeeVisible(true);
    setEmployeeStatus("Connecte.");
    employeeActive = true;
    resetIdleTimer();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setEmployeeStatus("Connexion...");
    try {
      await login(codeInput ? codeInput.value : "");
    } catch (error) {
      setEmployeeStatus(error.message, true);
    }
  });

  if (noteForm) {
    noteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = noteInput ? noteInput.value.trim() : "";
      if (!note) return;
      try {
        const data = await apiEmployee("/api/employee/planning-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note })
        });
        renderNotes(data.notes || []);
        if (noteInput) noteInput.value = "";
      } catch (error) {
        setEmployeeStatus(error.message, true);
      }
    });
  }

  if (stockAddForm) {
    stockAddForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = stockNameInput ? stockNameInput.value.trim() : "";
      const unit = stockUnitInput ? stockUnitInput.value.trim() : "";
      const qty = Number(stockQtyInput ? stockQtyInput.value : 0);
      if (!name || !unit || !Number.isFinite(qty) || qty < 0) {
        if (stocksStatus) {
          stocksStatus.textContent = "Nom, unite et quantite valides requis.";
          stocksStatus.classList.add("error");
        }
        return;
      }
      try {
        const data = await apiEmployee("/api/employee/stocks/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, unit, qty })
        });
        renderStocks(data.stocks);
        if (stockAddForm) stockAddForm.reset();
        if (stockQtyInput) stockQtyInput.value = "0";
        if (stocksStatus) {
          stocksStatus.textContent = "Produit ajoute au stock.";
          stocksStatus.classList.remove("error");
        }
      } catch (error) {
        if (stocksStatus) {
          stocksStatus.textContent = error.message;
          stocksStatus.classList.add("error");
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (!employeeActive) return;
      const confirmed = window.confirm("Confirmer la deconnexion de l'espace employe ?");
      if (!confirmed) return;
      try {
        await fetch("/api/employee/logout", {
          method: "POST"
        });
      } catch {
        // ignore network errors on logout
      } finally {
        clearEmployeeSession("Deconnecte.");
      }
    });
  }

  try {
    await loadDashboard();
    setEmployeeVisible(true);
    setEmployeeStatus("Session employee active.");
    employeeActive = true;
    resetIdleTimer();
  } catch {
    clearEmployeeSession("Acces reserve aux employes.");
  }

  bindIdleWatchers();
}

initEmployeeArea();
