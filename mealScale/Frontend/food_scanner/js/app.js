//let lastAnalyzeFormData = null;
const portionInput = document.getElementById("portionAmount");
const portionUnit = document.getElementById("portionUnit");
const retryBtn = document.getElementById("retryBtn");

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      resetAnalyzeFlow();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();

    if (user) {
      console.log("Usuario activo:", user);

      // Ejemplo: mostrar correo en el header
      const userLabel = document.getElementById("user-email");
      if (userLabel) {
        userLabel.textContent = user.email;
      }

      // Ejemplo: lógica por suscripción
      if (user.subscription !== "premium") {
        console.log("Usuario sin acceso premium");
      }
    }
  });

  // logout del sistema
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  });

  portionUnit?.addEventListener("change", () => {

    if (portionUnit.value === "portion") {
      portionInput.min = 0.25;
      portionInput.step = 0.25;
      portionInput.placeholder = "1";
      portionInput.value = "";
    } else {
      portionInput.min = 1;
      portionInput.step = 1;
      portionInput.placeholder = "100";
      portionInput.value = "";
    }
  });

  function resetAnalyzeFlow() {
    // 1️⃣ Limpiar estado
    window.lastAnalyzeFormData = null;

    // 2️⃣ Limpiar preview
    const preview = document.getElementById("photoPreview");
    if (preview) {
      preview.src = "";
      preview.classList.add("d-none");
    }

    // 3️⃣ Ocultar resultados
    const summary = document.getElementById("summary");
    if (summary) {
      summary.innerHTML = "";
    }

    // 4️⃣ Ocultar botones especiales
    const useDetectedBtn = document.getElementById("useDetectedBtn");
    if (useDetectedBtn) {
      useDetectedBtn.style.display = "none";
    }

    // 5️⃣ Rehabilitar botón de cámara
    const startBtn = document.getElementById("start-camera-btn");
    if (startBtn) {
      startBtn.disabled = false;
    }

    // 6️⃣ Reiniciar cámara
    if (window.initCamera) {
      window.initCamera();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCamera();
    initAnalyze();
    initTheme();
    initAuth();
  });