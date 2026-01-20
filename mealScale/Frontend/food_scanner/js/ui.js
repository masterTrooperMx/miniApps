/* -----------------------------------------------------
   MÉTRICAS NUTRICIONALES (badges + barras dinámicas)
----------------------------------------------------- */
let isAnalyzing = false;

function setAnalyzingState(active) {
  isAnalyzing = active;

  const overlay = document.getElementById("analyzingOverlay");
  if (overlay) {
    overlay.classList.toggle("d-none", !active);
  }

  // Inputs a bloquear
  const controls = [
    "start-camera-btn",
    "action-btn",
    "action-btn-preview",
    "analyzeBtn",
    "goal",
    "dishName",
    "photo"
  ];

  controls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = active;
  });
}

function updateMetric(idBadge, idProgress, value, minOk, maxOk) {
  const badge = document.getElementById(idBadge);
  const bar = document.getElementById(idProgress);

  // 🔒 Protección DOM
  if (!badge || !bar) return;

  // Normalizar
  const percent = Math.min(100, (value / maxOk) * 100);
  bar.style.width = percent + "%";

  // Colores
  if (value <= minOk) {
    badge.className = "badge bg-success px-3 py-2";
    bar.className = "progress-bar bg-success";
  } else if (value <= maxOk) {
    badge.className = "badge bg-warning text-dark px-3 py-2";
    bar.className = "progress-bar bg-warning";
  } else {
    badge.className = "badge bg-danger px-3 py-2";
    bar.className = "progress-bar bg-danger";
  }

  // Texto (preserva etiqueta base)
  const label = badge.innerText.split(":")[0];
  badge.innerText = `${label}: ${value}`;
}

/* =====================================================
   BREADCRUMB DINÁMICO
===================================================== */

function updateBreadcrumb(steps) {
  const breadcrumb = document.getElementById("breadcrumb-steps");
  if (!breadcrumb) return;

  breadcrumb.innerHTML = "";

  steps.forEach((label, index) => {
    const isLast = index === steps.length - 1;
    const li = document.createElement("li");
    li.classList.add("breadcrumb-item");

    if (isLast) {
      li.classList.add("active");
      li.setAttribute("aria-current", "page");
      li.textContent = label;
    } else {
      li.innerHTML = `<a href="#">${label}</a>`;
    }

    breadcrumb.appendChild(li);
  });
}

// reset dinamico de estadisticas
function resetSummaryUI(animated = true) {
  const summary = document.getElementById("summary");
  if (!summary) return;

  if (animated) {
    // Iniciar fade out
    summary.classList.remove("fade-slide-in");
    summary.classList.add("fade-slide-out");

    // Esperar animación antes de limpiar
    setTimeout(() => {
      clearSummaryContent();
      summary.classList.remove("fade-slide-out");
      summary.classList.add("fade-slide-in");
    }, 300);
  } else {
    clearSummaryContent();
  }

  // Estado global
  window.lastAnalyzeFormData = null;

  // Ocultar botón "usar detectado"
  const useDetectedBtn = document.getElementById("useDetectedBtn");
  if (useDetectedBtn) {
    useDetectedBtn.style.display = "none";
  }
}

function clearSummaryContent() {
  const badgeIds = [
    "badge-calorias",
    "badge-ig",
    "badge-proteina",
    "badge-fibra",
    "badge-grasa"
  ];

  badgeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = el.textContent.split(":")[0] + ": —";
      el.className = "badge px-3 py-2";
    }
  });

  const progressIds = [
    "progress-calorias",
    "progress-ig",
    "progress-proteina",
    "progress-fibra",
    "progress-grasa"
  ];

  progressIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.width = "0%";
      el.className = "progress-bar";
    }
  });
}

/* -----------------------------------------------------
   EXPONER FUNCIONES
----------------------------------------------------- */

window.updateMetric = updateMetric;
window.updateBreadcrumb = updateBreadcrumb;
window.resetSummaryUI = resetSummaryUI;
window.setAnalyzingState = setAnalyzingState;
