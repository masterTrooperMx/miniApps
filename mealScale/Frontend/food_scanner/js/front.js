/* =====================================================
   FRONT.JS — NutriVision A10-ops
   Flujo de cámara, vista previa, overlay, métricas dinámicas,
   tema oscuro/claro y fallback automático.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------------------------------
     ELEMENTOS DEL DOM
  ----------------------------------------------------- */

  const entryBtn = document.getElementById("start-camera-btn");
  const actionBtn = document.getElementById("action-btn");
  const actionBtnPreview = document.getElementById("action-btn-preview");

  const cameraContainer = document.getElementById("camera-container");
  const previewContainer = document.getElementById("preview-container");

  const cameraVideo = document.getElementById("camera-video");
  const previewImage = document.getElementById("preview-image");

  const photoInput = document.getElementById("photo");
  const themeIcon = document.getElementById("themeIcon");

  let stream = null;
  let mode = "idle";  
  
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

  // modes: idle → camera → preview
  /* -----------------------------------------------------
     DETECTAR SI HAY CÁMARA
  ----------------------------------------------------- */
  async function hasCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      return false;

    try {
      const test = await navigator.mediaDevices.getUserMedia({ video: true });
      test.getTracks().forEach(t => t.stop());
      return true;
    } catch {
      return false;
    }
  }



  /* -----------------------------------------------------
     ABRIR CÁMARA
  ----------------------------------------------------- */
  async function openCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      updateBreadcrumb(["Inicio", "Analizar platillo", "Capturando foto"]);

      cameraVideo.srcObject = stream;
      cameraContainer.style.display = "block";
      previewContainer.style.display = "none";
      entryBtn.style.display = "none";

      mode = "camera";

      // Cambiar texto del botón
      actionBtn.innerHTML = `<i class="bi bi-camera-fill"></i> Tomar foto`;

    } catch (err) {
      console.warn("No se pudo acceder a la cámara:", err);
      // Fallback → input file
      photoInput.click();
    }
  }



  /* -----------------------------------------------------
     CAPTURAR FOTOGRAFÍA
  ----------------------------------------------------- */
  function capturePhoto() {

    const canvas = document.createElement("canvas");
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(cameraVideo, 0, 0);

    const imgData = canvas.toDataURL("image/png");
    previewImage.src = imgData;
    updateBreadcrumb(["Inicio", "Analizar platillo", "Vista previa"]);

    // APAGAR CÁMARA
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Mostrar vista previa
    cameraContainer.style.display = "none";
    previewContainer.style.display = "block";

    // Cambiar a modo preview
    mode = "preview";

    // Configurar botón
    actionBtnPreview.innerHTML = `<i class="bi bi-arrow-counterclockwise"></i> Tomar otra foto`;

    // Convertir Base64 a archivo virtual para el input
    fetch(imgData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "foto.png", { type: "image/png" });
        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
      });
  }



  /* -----------------------------------------------------
     RETOMAR FOTO
  ----------------------------------------------------- */
  function retakePhoto() {
    previewContainer.style.display = "none";
    cameraContainer.style.display = "block";

    // VOLVER A ABRIR CÁMARA ✔✔✔
    openCamera();

    mode = "camera";

    actionBtn.innerHTML = `<i class="bi bi-camera-fill"></i> Tomar foto`;
    updateBreadcrumb(["Inicio", "Analizar platillo", "Capturando foto"]);
  }



  /* -----------------------------------------------------
     CUANDO SE CARGA ARCHIVO MANUAL (FALLBACK)
  ----------------------------------------------------- */
  photoInput.addEventListener("change", () => {
    if (photoInput.files?.[0]) {
      previewImage.src = URL.createObjectURL(photoInput.files[0]);

      previewContainer.style.display = "block";
      cameraContainer.style.display = "none";
      entryBtn.style.display = "none";

      mode = "preview";
      actionBtnPreview.innerHTML = `<i class="bi bi-arrow-counterclockwise"></i> Tomar otra foto`;
    }
  });



  /* -----------------------------------------------------
     EVENTOS PRINCIPALES
  ----------------------------------------------------- */

  // Botón “Abrir cámara”
  entryBtn.addEventListener("click", async () => {
    const ok = await hasCamera();
    if (ok) openCamera();
    else photoInput.click();
  });

  // Botón “Tomar foto”
  actionBtn.addEventListener("click", () => {
    if (mode === "camera") capturePhoto();
  });

  // Botón “Tomar otra foto”
  actionBtnPreview.addEventListener("click", () => {
    retakePhoto();
  });



  /* -----------------------------------------------------
     TEMA CLARO / OSCURO
  ----------------------------------------------------- */

  const toggle = document.getElementById("themeToggle");

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }

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



  /* -----------------------------------------------------
     MÉTRICAS NUTRICIONALES (badges + barras dinámicas)
  ----------------------------------------------------- */

  function updateMetric(idBadge, idProgress, value, minOk, maxOk) {

    const badge = document.getElementById(idBadge);
    const bar = document.getElementById(idProgress);

    // Normalizar
    const percent = Math.min(100, (value / maxOk) * 100);
    bar.style.width = percent + "%";

    // Colores
    if (value <= minOk) {
      badge.className = "badge bg-success px-3 py-2";
      bar.className = "progress-bar bg-success";
    } else if (value > minOk && value <= maxOk) {
      badge.className = "badge bg-warning px-3 py-2";
      bar.className = "progress-bar bg-warning";
    } else {
      badge.className = "badge bg-danger px-3 py-2";
      bar.className = "progress-bar bg-danger";
    }

    // Texto
    badge.innerText = badge.innerText.split(":")[0] + ": " + value;
  }


  /* -----------------------------------------------------
     EJEMPLO DE PRUEBA (puedes borrarlo luego)
  ----------------------------------------------------- */
  
  updateMetric("badge-calorias",  "progress-calorias",  620,  400, 700);
  updateMetric("badge-ig",        "progress-ig",        55,   40, 60);
  updateMetric("badge-proteina",  "progress-proteina",  22,   15, 35);
  updateMetric("badge-fibra",     "progress-fibra",     10,   8,  15);
  updateMetric("badge-grasa",     "progress-grasa",     32,   10, 25);

  /* =====================================================
   BREADCRUMB DINÁMICO
   ===================================================== */

    function updateBreadcrumb(steps) {
        const breadcrumb = document.getElementById("breadcrumb-steps");

        breadcrumb.innerHTML = ""; // limpiar

        steps.forEach((label, index) => {

            const isLast = index === steps.length - 1;

            const li = document.createElement("li");
            li.classList.add("breadcrumb-item");

            if (isLast) {
            // último paso (activo)
            li.classList.add("active");
            li.setAttribute("aria-current", "page");
            li.innerHTML = label;
            } else {
            li.innerHTML = `<a href="#">${label}</a>`;
            }

            breadcrumb.appendChild(li);
        });
    }
});


  /* -----------------------------------------------------
     GOOGLE AUTH
  ----------------------------------------------------- */

function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
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

const portionInput = document.getElementById("portionAmount");
const portionUnit = document.getElementById("portionUnit");

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
