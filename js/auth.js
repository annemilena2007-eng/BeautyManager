import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://hxxvtporroqbwgwojubo.supabase.co";
const SUPABASE_KEY = "sb_publishable_GlZDWok98G3_cO5wLn-kuw_CGkGeXSQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("BeautyManager conectado con Supabase");

const registroForm = document.getElementById("registroForm");

if (registroForm) {

    registroForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const negocio = document.getElementById("negocio").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const mensaje = document.getElementById("mensaje");

        if (password !== confirmPassword) {
            mensaje.textContent = "Las contraseñas no coinciden.";
            return;
        }

        if (password.length < 8) {
            mensaje.textContent = "La contraseña debe tener mínimo 8 caracteres.";
            return;
        }

        mensaje.textContent = "Creando cuenta...";

        const { data, error } = await supabase.auth.signUp({
            email: correo,
            password: password,
            options: {
                data: {
                    nombre: nombre,
                    negocio: negocio
                }
            }
        });

        if (error) {
            console.error(error);
            mensaje.textContent = error.message;
            return;
        }

        mensaje.textContent =
            "¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.";

        registroForm.reset();
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const correo = document.getElementById("loginCorreo").value.trim();
        const password = document.getElementById("loginPassword").value;
        const mensaje = document.getElementById("loginMensaje");

        mensaje.textContent = "Iniciando sesión...";

        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: password
        });

        if (error) {
    console.error(error);
    mensaje.textContent = "Correo o contraseña incorrectos.";
    return;
}

// Guardar el usuario actual para sus preferencias
localStorage.setItem(
    "beautymanager-usuario",
    data.user.id
);

const claveTema =
    `beautymanager-tema-${data.user.id}`;

const claveModo =
    `beautymanager-modo-${data.user.id}`;

// Si es una cuenta nueva, usar configuración predeterminada
if (!localStorage.getItem(claveTema)) {
    localStorage.setItem(
        claveTema,
        "morado"
    );
}

if (!localStorage.getItem(claveModo)) {
    localStorage.setItem(
        claveModo,
        "claro"
    );
}

mensaje.textContent = "¡Inicio de sesión exitoso!";

window.location.href = "dashboard.html";
    });
}
const usuarioInfo = document.getElementById("usuarioInfo");
const cerrarSesion = document.getElementById("cerrarSesion");

if (usuarioInfo) {

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = "index.html";
    } else {

        const nombre = session.user.user_metadata?.nombre;
        const negocio = session.user.user_metadata?.negocio;

        usuarioInfo.textContent =
            `Hola ${nombre || "emprendedora"} 💗 | ${negocio || "Tu emprendimiento"}`;
    }
}

if (cerrarSesion) {

    cerrarSesion.addEventListener("click", async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error(error);
            return;
        }

        // Ya no hay una cuenta activa
        localStorage.removeItem(
            "beautymanager-usuario"
        );

        // El login siempre inicia en morado y claro
        window.location.href = "index.html";
    });
}