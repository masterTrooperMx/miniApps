/* -----------------------------------------------------
   IA ANALYSIS
----------------------------------------------------- */
console.log("ANALYZE.JS VERSION 2026-01-20 23:15");

let lastAnalyzeFormData = null;
let statusModalTimer = null;

async function submitAnalyze(formData) {
  if (isAnalyzing) return;

  setAnalyzingState(true);

  try {
    const token = localStorage.getItem("access_token");

    const resp = await fetch("http://localhost:8000/api/v1/analyze", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!resp.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    const data = await resp.json();

    console.log("ANALYZE RESPONSE TYPE:", typeof data, data);

    renderAnalyzeResult(data);

  } catch (err) {
    console.error("Analyze error:", err);
    showStatusModal(
      "Error",
      "No se pudo completar el análisis. Intenta nuevamente."
    );
  } finally {
    setAnalyzingState(false);
  }
}


function igBadge(level) {
  switch (level) {
    case "bajo": return "bg-success";
    case "medio": return "bg-warning text-dark";
    case "alto": return "bg-danger";
    default: return "bg-secondary";
  }
}

function nutrientBar(label, value, max, unit = "") {
  const percent = Math.min((value / max) * 100, 100);

  return `
    <div class="mb-2">
      <small>${label}: <strong>${value}${unit}</strong></small>
      <div class="progress">
        <div class="progress-bar" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

function showStatusModal(title, message) {
  const modalEl = document.getElementById("statusModal");
  if (!modalEl) return;

  const modal = new bootstrap.Modal(modalEl);

  document.getElementById("statusModalTitle").innerText = title;
  document.getElementById("statusModalBody").innerHTML = message;

  modal.show();

  clearTimeout(statusModalTimer);
  statusModalTimer = setTimeout(() => modal.hide(), 30000);
}

function renderAnalyzeResult(data) {
  const summary = document.getElementById("summary");
  const useDetectedBtn = document.getElementById("useDetectedBtn");
  const invalidPanel = document.getElementById("invalidImagePanel");
  const invalidMsg = document.getElementById("invalidImageMessage");
  console.log("RENDER DATA", data);

  resetSummaryUI(false);

  if (invalidPanel) invalidPanel.classList.add("d-none");

  // CASO: imagen no válida
  if (data.status === "invalid_image") {
    if (invalidPanel) {
      if (invalidMsg && data.descripcion) {
        invalidMsg.textContent = data.descripcion;
      }
      invalidPanel.classList.remove("d-none");
    }
    return;
  }

  if (useDetectedBtn) useDetectedBtn.style.display = "none";
  if (!summary) return;

  if (!data || typeof data !== "object") {
    showStatusModal(
      "Error inesperado",
      "La respuesta del servidor no es válida."
    );
    return;
  }
  if (!("status" in data)) {
    showStatusModal(
      "Respuesta incompleta",
      "El análisis no devolvió un estado válido."
    );
    return;
  }

  // MISMATCH
  if (data.status === "mismatch") {
    showStatusModal(
      "Imagen y descripción no coinciden",
      `
        <p>${data.descripcion}</p>
        <p class="mb-0">¿Deseas continuar usando el alimento detectado?</p>
      `
    );

    if (useDetectedBtn) {
      useDetectedBtn.style.display = "block";
      useDetectedBtn.classList.add("animate-slide-in");
    }

    summary.innerHTML = "";
    return;
  }

  // Imagen inválida
  if (data.status === "invalid_image") {
    showStatusModal(
      "Imagen no válida",
      data.descripcion || "La imagen no parece contener un alimento."
    );
    summary.innerHTML = "";
    return;
  }

  // OK
  const v = data.valores_nutricionales;

  summary.innerHTML = `
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h5 class="mb-1">${data.alimento}</h5>
        <small class="text-muted">
          Cantidad analizada: ${data.cantidad_g} g · IG: ${data.indice_glucemico}
        </small>
      </div>

      <span class="badge ${igBadge(data.indice_glucemico)}">
        IG ${data.indice_glucemico}
      </span>
    </div>

    ${nutrientBar("Calorías", v.calorias_kcal, 800, " kcal")}
    ${nutrientBar("Proteína", v.proteinas_g, 50, " g")}
    ${nutrientBar("Grasas", v.grasas_g, 70, " g")}
    ${nutrientBar("Carbohidratos", v.carbohidratos_g, 300, " g")}
    ${nutrientBar("Fibra", v.fibra_g, 40, " g")}
    ${nutrientBar("Azúcares", v.azucares_g, 50, " g")}
    ${nutrientBar("Sodio", v.sodio_mg, 2300, " mg")}

    ${
      data.can_save
        ? `<button class="btn btn-success w-100 mt-3">Guardar en historial</button>`
        : `<p class="small text-muted mt-3 mb-0">Disponible solo con suscripción</p>`
    }
  `;
}

function initAnalyze() {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const useDetectedBtn = document.getElementById("useDetectedBtn");

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
      const photoInput = document.getElementById("photo");
      const dishNameInput = document.getElementById("dishName");
      const goalSelect = document.getElementById("goal");

      if (!photoInput?.files?.[0]) {
        showStatusModal("Falta imagen", "Primero toma o selecciona una foto.");
        return;
      }

      const formData = new FormData();
      formData.append("image", photoInput.files[0]);

      if (dishNameInput?.value.trim()) {
        formData.append("description", dishNameInput.value.trim());
      }

      if (goalSelect) {
        formData.append("goal", goalSelect.value);
      }

      lastAnalyzeFormData = formData;
      submitAnalyze(formData);
    });
  }

  if (useDetectedBtn) {
    useDetectedBtn.addEventListener("click", async () => {
      if (!lastAnalyzeFormData) return;

      const retryFormData = new FormData();
      for (const [k, v] of lastAnalyzeFormData.entries()) {
        retryFormData.append(k, v);
      }

      retryFormData.append("use_detected", "true");
      submitAnalyze(retryFormData);
    });
  }

  console.log("Analyze initialized");
}

window.initAnalyze = initAnalyze;
