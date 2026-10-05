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

window.addEventListener("resize", () => {
  const nowIsDesktop = isDesktop();

  if (nowIsDesktop !== lastIsDesktop) {
    if (nowIsDesktop) {
      closeMobileNavigation();
    } else {
      closeDesktopMenus(0);
    }

    lastIsDesktop = nowIsDesktop;
  }
});
