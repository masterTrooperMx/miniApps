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

/* -----------------------------------------------------
   EXPONER FUNCIONES
----------------------------------------------------- */

window.updateMetric = updateMetric;
window.updateBreadcrumb = updateBreadcrumb;
