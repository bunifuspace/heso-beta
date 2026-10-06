const track = document.querySelector(".expertise-track");
const windowEl = document.querySelector(".expertise-window");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
const dotsContainer = document.querySelector(".slider-dots");

const autoplayDelay = 7000;

let cards = [...document.querySelectorAll(".expertise-card")];
let originalCards = [...cards];

let index = 0;
let autoplay;
let startX = 0;
let currentX = 0;
let dragging = false;
let isTransitioning = false;

function visibleCards() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function getStep() {
  if (!cards.length || !track) return 0;

  const cardWidth = cards[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(track).gap) || 0;

  return cardWidth + gap;
}

function createClones() {
  if (!track || !originalCards.length) return;

  track.innerHTML = "";

  originalCards.forEach((card) => {
    track.appendChild(card.cloneNode(true));
  });

  const visible = visibleCards();

  const startClones = originalCards
    .slice(-visible)
    .map((card) => card.cloneNode(true));

  const endClones = originalCards
    .slice(0, visible)
    .map((card) => card.cloneNode(true));

  startClones.forEach((card) => {
    track.insertBefore(card, track.firstChild);
  });

  endClones.forEach((card) => {
    track.appendChild(card);
  });

  cards = [...track.querySelectorAll(".expertise-card")];

  index = visible;

  track.style.transition = "none";
  track.style.transform = `translateX(-${index * getStep()}px)`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      track.style.transition = "transform 600ms cubic-bezier(.22,1,.36,1)";
    });
  });
}

function createDots() {
  if (!dotsContainer) return;

  dotsContainer.innerHTML = "";

  originalCards.forEach((_, i) => {
    const button = document.createElement("button");

    button.className = "slider-dot";
    button.dataset.index = i;
    button.setAttribute("aria-label", `Slide ${i + 1}`);

    const span = document.createElement("span");

    button.appendChild(span);
    dotsContainer.appendChild(button);
  });
}

function getRealIndex() {
  const visible = visibleCards();

  return (index - visible + originalCards.length) % originalCards.length;
}

function updateDots() {
  if (!dotsContainer || !originalCards.length) return;

  const realIndex = getRealIndex();

  [...dotsContainer.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === realIndex);
  });
}

function updatePosition(animate = true) {
  if (!track) return;

  track.style.transition = animate
    ? "transform 600ms cubic-bezier(.22,1,.36,1)"
    : "none";

  track.style.transform = `translateX(-${index * getStep()}px)`;

  updateDots();
}

function nextSlide() {
  if (!track || isTransitioning) return;

  isTransitioning = true;

  index++;

  updatePosition();

  restartAutoplay();
}

function previousSlide() {
  if (!track || isTransitioning) return;

  isTransitioning = true;

  index--;

  updatePosition();

  restartAutoplay();
}

track?.addEventListener("transitionend", () => {
  const visible = visibleCards();

  if (index >= originalCards.length + visible) {
    index = visible;

    updatePosition(false);
  }

  if (index < visible) {
    index = originalCards.length + visible - 1;

    updatePosition(false);
  }

  isTransitioning = false;
  updateDots();
});

next?.addEventListener("click", nextSlide);

prev?.addEventListener("click", previousSlide);

function restartAutoplay() {
  clearInterval(autoplay);

  if (!track || originalCards.length <= visibleCards()) return;

  autoplay = setInterval(() => {
    nextSlide();
  }, autoplayDelay);
}

function goToRealSlide(realIndex) {
  if (!track || isTransitioning) return;

  const visible = visibleCards();

  index = realIndex + visible;

  updatePosition();

  restartAutoplay();
}

dotsContainer?.addEventListener("click", (event) => {
  const dot = event.target.closest(".slider-dot");

  if (!dot) return;

  goToRealSlide(Number(dot.dataset.index));
});

windowEl?.addEventListener("pointerdown", (event) => {
  if (event.button !== undefined && event.button !== 0) return;
  if (!track) return;

  dragging = true;
  startX = event.clientX;
  currentX = startX;

  clearInterval(autoplay);

  windowEl.classList.add("dragging");

  track.style.transition = "none";

  windowEl.setPointerCapture(event.pointerId);
});

windowEl?.addEventListener("pointermove", (event) => {
  if (!dragging || !track) return;

  currentX = event.clientX;

  const distance = currentX - startX;
  const baseOffset = -(index * getStep());

  track.style.transform = `translateX(${baseOffset + distance}px)`;
});

function finishDrag() {
  if (!dragging || !track) return;

  dragging = false;

  windowEl.classList.remove("dragging");

  const distance = currentX - startX;
  const threshold = Math.min(100, windowEl.offsetWidth * 0.15);

  track.style.transition = "transform 600ms cubic-bezier(.22,1,.36,1)";

  if (Math.abs(distance) > threshold) {
    if (distance < 0) {
      index++;
    } else {
      index--;
    }
  }

  updatePosition();

  restartAutoplay();
}

windowEl?.addEventListener("pointerup", finishDrag);
windowEl?.addEventListener("pointercancel", finishDrag);

const mobileMenuButton = document.getElementById("mobile-menu-button");

const mobileNavigation = document.getElementById("mobile-navigation");

const mobileClose = document.getElementById("mobile-close");

const mobileMainMenu = document.getElementById("mobile-main-menu");

const navShell = document.querySelector(".nav-shell");

const mobileBranches = document.querySelectorAll("[data-mobile-menu]");

const mobileBackButtons = document.querySelectorAll(".mobile-back");

const desktopNavItems = document.querySelectorAll(".nav-item");

const desktopMenus = document.querySelectorAll(".desktop-mega-menu");

const DESKTOP_BREAKPOINT = 850;
const DESKTOP_CLOSE_DELAY = 180;

let previousBodyOverflow = "";
let desktopCloseTimer = null;

function isDesktop() {
  return window.innerWidth > DESKTOP_BREAKPOINT;
}

function openMobileNavigation() {
  if (!mobileNavigation) return;

  previousBodyOverflow = document.body.style.overflow;

  mobileNavigation.classList.add("is-open");
  navShell?.classList.add("nav-hidden");

  document.body.style.overflow = "hidden";
}

function closeMobileNavigation() {
  if (!mobileNavigation) return;

  mobileNavigation.classList.remove("is-open");
  navShell?.classList.remove("nav-hidden");

  document.querySelectorAll(".mobile-submenu").forEach((menu) => {
    menu.classList.remove("is-active");
  });

  mobileMainMenu?.classList.remove("is-hidden");

  document.body.style.overflow = previousBodyOverflow;
}

function openMobileSubmenu(menuId) {
  if (!mobileMainMenu) return;

  const submenu = document.getElementById(menuId);

  if (!submenu) return;

  document.querySelectorAll(".mobile-submenu").forEach((menu) => {
    menu.classList.remove("is-active");
  });

  mobileMainMenu.classList.add("is-hidden");
  submenu.classList.add("is-active");
}

function closeMobileSubmenu(submenu) {
  if (!submenu || !mobileMainMenu) return;

  submenu.classList.remove("is-active");
  mobileMainMenu.classList.remove("is-hidden");
}

function cancelDesktopClose() {
  if (desktopCloseTimer) {
    clearTimeout(desktopCloseTimer);
    desktopCloseTimer = null;
  }
}

function closeDesktopMenus(delay = DESKTOP_CLOSE_DELAY) {
  cancelDesktopClose();

  if (delay === 0) {
    desktopMenus.forEach((menu) => {
      menu.classList.remove("is-open");
    });

    return;
  }

  desktopCloseTimer = setTimeout(() => {
    desktopMenus.forEach((menu) => {
      menu.classList.remove("is-open");
    });

    desktopCloseTimer = null;
  }, delay);
}

function openDesktopMenu(menuId) {
  if (!isDesktop()) return;

  cancelDesktopClose();

  desktopMenus.forEach((menu) => {
    menu.classList.remove("is-open");
  });

  const targetMenu = document.getElementById(menuId);

  if (targetMenu) {
    targetMenu.classList.add("is-open");
  }
}

mobileMenuButton?.addEventListener("click", () => {
  if (mobileNavigation?.classList.contains("is-open")) {
    closeMobileNavigation();
  } else {
    openMobileNavigation();
  }
});

mobileClose?.addEventListener("click", closeMobileNavigation);

mobileBranches.forEach((branch) => {
  branch.addEventListener("click", () => {
    openMobileSubmenu(branch.dataset.mobileMenu);
  });
});

mobileBackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const submenu = button.closest(".mobile-submenu");

    if (submenu) {
      closeMobileSubmenu(submenu);
    }
  });
});

desktopNavItems.forEach((item) => {
  const trigger = item.querySelector(".nav-trigger");

  if (!trigger) return;

  const menuId = trigger.dataset.menu;

  item.addEventListener("mouseenter", () => {
    if (!isDesktop()) return;

    openDesktopMenu(menuId);
  });

  item.addEventListener("mouseleave", () => {
    if (!isDesktop()) return;

    closeDesktopMenus();
  });
});

desktopMenus.forEach((menu) => {
  menu.addEventListener("mouseenter", () => {
    if (!isDesktop()) return;

    cancelDesktopClose();
    menu.classList.add("is-open");
  });

  menu.addEventListener("mouseleave", () => {
    if (!isDesktop()) return;

    closeDesktopMenus();
  });
});

document.addEventListener("click", (event) => {
  if (!isDesktop()) return;

  const clickedNav = event.target.closest(".nav-item");
  const clickedMenu = event.target.closest(".desktop-mega-menu");

  if (!clickedNav && !clickedMenu) {
    closeDesktopMenus(0);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeDesktopMenus(0);

  if (mobileNavigation?.classList.contains("is-open")) {
    const activeSubmenu = document.querySelector(".mobile-submenu.is-active");

    if (activeSubmenu) {
      closeMobileSubmenu(activeSubmenu);
    } else {
      closeMobileNavigation();
    }
  }
});

let lastIsDesktop = isDesktop();

function handleResize() {
  if (track && originalCards.length) {
    createClones();
    updateDots();
    restartAutoplay();
  }

  const nowIsDesktop = isDesktop();

  if (nowIsDesktop !== lastIsDesktop) {
    if (nowIsDesktop) {
      closeMobileNavigation();
    } else {
      closeDesktopMenus(0);
    }

    lastIsDesktop = nowIsDesktop;
  }
}

window.addEventListener("resize", handleResize);

window.addEventListener("load", () => {
  if (track && originalCards.length) {
    createDots();
    createClones();
    updateDots();
    restartAutoplay();
  }
});
