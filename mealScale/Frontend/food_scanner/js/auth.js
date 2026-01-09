const API_URL = "http://localhost:8000/api/v1";

/* -----------------------------------------------------
   AUTH HELPERS
----------------------------------------------------- */

function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}

function saveSession(data) {
  localStorage.setItem("access_token", data.access_token);
}

function redirectUser() {
  window.location.href = "/base.html";
}

/* -----------------------------------------------------
   LOGIN (EMAIL / PASSWORD) – opcional
----------------------------------------------------- */

async function login() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  const errorBox = document.getElementById("error");

  if (!email || !password) return;

  errorBox?.classList.add("d-none");

  try {
    const resp = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!resp.ok) throw new Error("Credenciales inválidas");

    const data = await resp.json();
    saveSession(data);
    redirectUser();

  } catch (err) {
    if (errorBox) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("d-none");
    }
  }
}

/* -----------------------------------------------------
   GOOGLE LOGIN
----------------------------------------------------- */

async function handleGoogleLogin(response) {
  const googleIdToken = response.credential;
  if (!googleIdToken) return;

  try {
    const resp = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: googleIdToken })
    });

    if (!resp.ok) {
      throw new Error("Error al autenticar con Google");
    }

    const data = await resp.json();
    saveSession(data);
    redirectUser();

  } catch (err) {
    console.error(err);
    alert("No se pudo iniciar sesión con Google");
  }
}

/* -----------------------------------------------------
   INIT
----------------------------------------------------- */

function initAuth() {
  const user = getCurrentUser();

  if (user) {
    console.log("Authenticated:", user.email, user.subscription);
  } else {
    console.log("No authenticated user");
  }
}

window.initAuth = initAuth;
window.getCurrentUser = getCurrentUser;
window.handleGoogleLogin = handleGoogleLogin;
