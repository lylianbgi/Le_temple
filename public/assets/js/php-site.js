document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const menuBackdrop = document.querySelector(".menu-backdrop");

function setMenuState(isOpen) {
  if (!menuToggle || !menu || !menuBackdrop) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menu.classList.toggle("open", isOpen);
  menuBackdrop.classList.toggle("open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle && menu && menuBackdrop) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  menuBackdrop.addEventListener("click", () => setMenuState(false));

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
}

document.querySelectorAll("[data-stock-used]").forEach((input) => {
  input.addEventListener("input", (event) => {
    const row = event.currentTarget.closest("[data-stock-row]");
    if (!row) {
      return;
    }

    const initialValue = Number(row.dataset.stockInitial || "0");
    const usedField = row.querySelector("[data-stock-used]");
    const remainingField = row.querySelector("[data-stock-remaining]");

    if (!usedField || !remainingField) {
      return;
    }

    const usedValue = Number(usedField.value || "0");
    const remainingValue = Math.max(initialValue - usedValue, 0);
    remainingField.value = String(remainingValue);
  });
});
