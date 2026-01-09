//let lastAnalyzeFormData = null;
const portionInput = document.getElementById("portionAmount");
const portionUnit = document.getElementById("portionUnit");

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

  document.addEventListener("DOMContentLoaded", () => {
    initCamera();
    initAnalyze();
    initTheme();
    initAuth();
  });