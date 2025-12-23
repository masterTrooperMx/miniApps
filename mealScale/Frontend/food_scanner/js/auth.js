const API_URL = "http://localhost:8000/api/v1";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("error");

  errorBox.classList.add("d-none");

  try {
    const resp = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!resp.ok) throw new Error("Credenciales inválidas");

    const data = await resp.json();
    saveSession(data);
    redirectUser(data.user);

  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove("d-none");
  }
}

async function loginWithGoogle() {
  // Este token normalmente lo obtienes del Google SDK
  const googleIdToken = prompt("Pega aquí el Google ID Token (demo)");

  if (!googleIdToken) return;

  try {
    const resp = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: googleIdToken })
    });

    if (!resp.ok) throw new Error("Error con Google login");

    const data = await resp.json();
    saveSession(data);
    redirectUser(data.user);

  } catch (err) {
    alert(err.message);
  }
}

function saveSession(data) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

function redirectUser(user) {
  // Ejemplo de control por suscripción
  if (user.subscription === "free") {
    window.location.href = "/app.html";
  } else {
    window.location.href = "/app.html";
  }
}

async function handleGoogleLogin(response) {
  // Este token es el JWT de Google
  const googleIdToken = response.credential;

  try {
    const resp = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_token: googleIdToken
      })
    });

    if (!resp.ok) {
      throw new Error("Error al autenticar con Google");
    }

    const data = await resp.json();

    // Guardar sesión propia
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirigir
    window.location.href = "/base.html";

  } catch (err) {
    console.error(err);
    alert("No se pudo iniciar sesión con Google");
  }
}
