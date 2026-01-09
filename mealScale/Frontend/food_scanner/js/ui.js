/* -----------------------------------------------------
   MÉTRICAS NUTRICIONALES (badges + barras dinámicas)
----------------------------------------------------- */

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

// reset dinamico
function resetSummaryUI() {
  const summary = document.getElementById("summary");
  if (!summary) return;

  // Limpiar badges
  const badgeIds = [
    "badge-calorias",
    "badge-ig",
    "badge-proteina",
    "badge-fibra",
    "badge-grasa"
  ];

  badgeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = el.textContent.split(":")[0] + ": —";
    if (el) el.className = "badge px-3 py-2";
  });

  // Limpiar progress bars
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

  // Ocultar botón "usar detectado"
  const useDetectedBtn = document.getElementById("useDetectedBtn");
  if (useDetectedBtn) {
    useDetectedBtn.style.display = "none";
  }

  // Limpiar estado global
  window.lastAnalyzeFormData = null;
}

/* -----------------------------------------------------
   EXPONER FUNCIONES
----------------------------------------------------- */

window.updateMetric = updateMetric;
window.updateBreadcrumb = updateBreadcrumb;
window.resetSummaryUI = resetSummaryUI;
