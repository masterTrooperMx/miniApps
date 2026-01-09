// js/camera.js

let stream = null;
let mode = "idle";
let initialized = false;

/* -------------------------
   Helpers
------------------------- */

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

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

/* -------------------------
   Camera actions
------------------------- */

async function openCamera(
  cameraVideo,
  cameraContainer,
  previewContainer,
  entryBtn,
  actionBtn,
  photoInput
) {
  stopCamera();

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    updateBreadcrumb(["Inicio", "Analizar platillo", "Capturando foto"]);

    cameraVideo.srcObject = stream;
    cameraVideo.play();

    cameraContainer.style.display = "block";
    previewContainer.style.display = "none";
    entryBtn.style.display = "none";
    actionBtn.style.display = "block";

    actionBtn.innerHTML = `<i class="bi bi-camera-fill"></i> Tomar foto`;
    mode = "camera";
  } catch (err) {
    console.warn("No se pudo acceder a la cámara:", err);
    photoInput.click();
  }
}

function capturePhoto(
  cameraVideo,
  previewImage,
  cameraContainer,
  previewContainer,
  actionBtnPreview,
  photoInput
) {
  const canvas = document.createElement("canvas");
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  canvas.getContext("2d").drawImage(cameraVideo, 0, 0);

  const imgData = canvas.toDataURL("image/png");
  previewImage.src = imgData;

  updateBreadcrumb(["Inicio", "Analizar platillo", "Vista previa"]);

  stopCamera();

  cameraContainer.style.display = "none";
  previewContainer.style.display = "block";
  actionBtnPreview.style.display = "block";

  actionBtnPreview.innerHTML = `<i class="bi bi-arrow-counterclockwise"></i> Tomar otra foto`;
  mode = "preview";

  fetch(imgData)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], "foto.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(file);
      photoInput.files = dt.files;
    });
}

function resetCameraFlow(
  cameraVideo,
  cameraContainer,
  previewContainer,
  previewImage,
  entryBtn,
  actionBtn,
  actionBtnPreview,
  photoInput
) {
  stopCamera();

  previewImage.src = "";
  photoInput.value = "";

  cameraContainer.style.display = "none";
  previewContainer.style.display = "none";
  actionBtn.style.display = "none";
  actionBtnPreview.style.display = "none";
  entryBtn.style.display = "block";

  mode = "idle";
}

/* -------------------------
   Init (solo una vez)
------------------------- */

function initCamera() {
  if (initialized) return;

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
    if (ok) {
      openCamera(
        cameraVideo,
        cameraContainer,
        previewContainer,
        entryBtn,
        actionBtn,
        photoInput
      );
    } else {
      photoInput.click();
    }
  });

  actionBtn.addEventListener("click", () => {
    if (mode === "camera") {
      capturePhoto(
        cameraVideo,
        previewImage,
        cameraContainer,
        previewContainer,
        actionBtnPreview,
        photoInput
      );
    }
  });

  actionBtnPreview.addEventListener("click", () => {
    resetCameraFlow(
      cameraVideo,
      cameraContainer,
      previewContainer,
      previewImage,
      entryBtn,
      actionBtn,
      actionBtnPreview,
      photoInput
    );

    if (window.resetSummaryUI) {
      window.resetSummaryUI();
    }
  });


  photoInput.addEventListener("change", () => {
    if (photoInput.files?.[0]) {
      previewImage.src = URL.createObjectURL(photoInput.files[0]);
      previewContainer.style.display = "block";
      cameraContainer.style.display = "none";
      entryBtn.style.display = "none";
      actionBtnPreview.style.display = "block";
      mode = "preview";
    }
  });

  initialized = true;
  console.log("Camera initialized");
}

window.initCamera = initCamera;
