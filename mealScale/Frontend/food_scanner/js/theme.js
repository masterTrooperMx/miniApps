/* -----------------------------------------------------
    TEMA CLARO / OSCURO
----------------------------------------------------- */

const toggle = document.getElementById("themeToggle");

// Inicializar
const stored = localStorage.getItem("theme");
updateThemeIcon(stored === "dark");
applyTheme(stored === "dark");
toggle.checked = stored === "dark";

    toggle.addEventListener("change", () => {
        const isDark = toggle.checked;
        applyTheme(isDark);
        updateThemeIcon(isDark);
    });

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
        }
    }

    function updateThemeIcon(isDark) {
        // Añadir clase de animación temporal
        themeIcon.classList.add("scale");

        setTimeout(() => themeIcon.classList.remove("scale"), 250);

        if (isDark) {
            themeIcon.className = "bi bi-lightbulb-off-fill fs-5 theme-icon-animate";
        } else {
            themeIcon.className = "bi bi-lightbulb-fill fs-5 theme-icon-animate";
        }
    }

    function initTheme() {
    console.log("Theme initialized");
    }

window.initTheme = initTheme;
