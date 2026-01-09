// camera.js

let stream = null;
let mode = "idle";

async function hasCamera() {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    const test = await navigator.mediaDevices.getUserMedia({ video: true });
    test.getTracks().forEach(t => t.stop());
    return true;
  } catch {
    return false;
  }
}

async function openCamera(cameraVideo, cameraContainer, previewContainer, entryBtn, actionBtn, photoInput) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    updateBreadcrumb(["Inicio", "Analizar platillo", "Capturando foto"]);

    cameraVideo.srcObject = stream;
    cameraContainer.style.display = "block";
    previewContainer.style.display = "none";
    entryBtn.style.display = "none";

    mode = "camera";
    actionBtn.innerHTML = `<i class="bi bi-camera-fill"></i> Tomar foto`;
  } catch (err) {
    console.warn("No se pudo acceder a la cámara:", err);
    photoInput.click();
  }
}

function capturePhoto(cameraVideo, previewImage, cameraContainer, previewContainer, actionBtnPreview, photoInput) {
  const canvas = document.createElement("canvas");
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  canvas.getContext("2d").drawImage(cameraVideo, 0, 0);

  const imgData = canvas.toDataURL("image/png");
  previewImage.src = imgData;
  updateBreadcrumb(["Inicio", "Analizar platillo", "Vista previa"]);

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  cameraContainer.style.display = "none";
  previewContainer.style.display = "block";
  mode = "preview";

  actionBtnPreview.innerHTML = `<i class="bi bi-arrow-counterclockwise"></i> Tomar otra foto`;

  fetch(imgData)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], "foto.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(file);
      photoInput.files = dt.files;
    });
}

function retakePhoto(cameraContainer, previewContainer, actionBtn) {
  previewContainer.style.display = "none";
  cameraContainer.style.display = "block";
  mode = "camera";
  actionBtn.innerHTML = `<i class="bi bi-camera-fill"></i> Tomar foto`;
}

function initCamera() {
  const entryBtn = document.getElementById("start-camera-btn");
  const actionBtn = document.getElementById("action-btn");
  const actionBtnPreview = document.getElementById("action-btn-preview");
  const cameraContainer = document.getElementById("camera-container");
  const previewContainer = document.getElementById("preview-container");
  const cameraVideo = document.getElementById("camera-video");
  const previewImage = document.getElementById("preview-image");
  const photoInput = document.getElementById("photo");

  if (!entryBtn || !actionBtn || !actionBtnPreview) return;

  entryBtn.addEventListener("click", async () => {
    const ok = await hasCamera();
    if (ok) openCamera(cameraVideo, cameraContainer, previewContainer, entryBtn, actionBtn, photoInput);
    else photoInput.click();
  });

  actionBtn.addEventListener("click", () => {
    if (mode === "camera") {
      capturePhoto(cameraVideo, previewImage, cameraContainer, previewContainer, actionBtnPreview, photoInput);
    }
  });

  actionBtnPreview.addEventListener("click", () => {
    retakePhoto(cameraContainer, previewContainer, actionBtn);
  });

  photoInput.addEventListener("change", () => {
    if (photoInput.files?.[0]) {
      previewImage.src = URL.createObjectURL(photoInput.files[0]);
      previewContainer.style.display = "block";
      cameraContainer.style.display = "none";
      entryBtn.style.display = "none";
      mode = "preview";
    }
  });

  console.log("Camera initialized");
}

window.initCamera = initCamera;
