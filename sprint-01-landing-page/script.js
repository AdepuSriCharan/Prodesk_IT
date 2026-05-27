(function () {
  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var themeToggle = document.getElementById("theme-toggle");
  var themeToggleMobile = document.getElementById("theme-toggle-mobile");
  var yearEl = document.getElementById("year");

  function applyThemeButtonLabel() {
    var isDark = document.documentElement.classList.contains("dark");
    var label = isDark ? "Light Mode" : "Dark Mode";

    if (themeToggle) themeToggle.textContent = label;
    if (themeToggleMobile) themeToggleMobile.textContent = label;
  }

  function toggleTheme() {
    var root = document.documentElement;
    var isDark = root.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyThemeButtonLabel();
  }

  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (themeToggleMobile) themeToggleMobile.addEventListener("click", toggleTheme);

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  applyThemeButtonLabel();
})();
