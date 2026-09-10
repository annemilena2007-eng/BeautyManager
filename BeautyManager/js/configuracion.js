import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// =====================================================
// CONEXIÓN CON SUPABASE
// =====================================================

const SUPABASE_URL = "https://hxxvtporroqbwgwojubo.supabase.co";
const SUPABASE_KEY = "sb_publishable_GlZDWok98G3_cO5wLn-kuw_CGkGeXSQ";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// ELEMENTOS DEL HTML
// =====================================================

const formNegocio = document.getElementById("formNegocio");

const formPassword = document.getElementById("formPassword");

const nombreNegocio = document.getElementById("nombreNegocio");

const nombrePropietario =
    document.getElementById("nombrePropietario");

const telefonoNegocio =
    document.getElementById("telefonoNegocio");

const correoNegocio =
    document.getElementById("correoNegocio");

const direccionNegocio =
    document.getElementById("direccionNegocio");

const descripcionNegocio =
    document.getElementById("descripcionNegocio");

const correoCuenta =
    document.getElementById("correoCuenta");

const usuarioInicial =
    document.getElementById("usuarioInicial");

const modoOscuro =
    document.getElementById("modoOscuro");

const passwordActual =
    document.getElementById("passwordActual");

const nuevaPassword =
    document.getElementById("nuevaPassword");

const confirmarPassword =
    document.getElementById("confirmarPassword");

const strengthProgress =
    document.getElementById("strengthProgress");

const strengthText =
    document.getElementById("strengthText");

const cerrarSesion =
    document.getElementById("cerrarSesion");

const cerrarSesionCuenta =
    document.getElementById("cerrarSesionCuenta");

const cambiarCuenta =
    document.getElementById("cambiarCuenta");



// =====================================================
// USUARIO ACTUAL
// =====================================================

let usuarioActual = null;

// =====================================================
// MODO OSCURO POR USUARIO
// =====================================================

function obtenerClaveModo() {

    if (!usuarioActual) {
        return "beautymanager-modo";
    }

    return `beautymanager-modo-${usuarioActual.id}`;
}


function aplicarModoOscuro() {

    const modoGuardado =
        localStorage.getItem(obtenerClaveModo()) || "claro";


    if (modoGuardado === "oscuro") {

        document.documentElement.classList.add(
            "modo-oscuro"
        );

        document.body.classList.add(
            "modo-oscuro"
        );

        if (modoOscuro) {
            modoOscuro.checked = true;
        }

    } else {

        document.documentElement.classList.remove(
            "modo-oscuro"
        );

        document.body.classList.remove(
            "modo-oscuro"
        );

        if (modoOscuro) {
            modoOscuro.checked = false;
        }

    }

}


// Cambiar modo cuando el usuario mueve el interruptor

if (modoOscuro) {

    modoOscuro.addEventListener(
        "change",
        () => {

            const claveModo =
                obtenerClaveModo();


            if (modoOscuro.checked) {

                localStorage.setItem(
                    claveModo,
                    "oscuro"
                );

            } else {

                localStorage.setItem(
                    claveModo,
                    "claro"
                );

            }


            // Aplicar el cambio inmediatamente
            aplicarModoOscuro();

        }
    );

}

// =====================================================
// COLOR PASTEL DE LA INTERFAZ POR USUARIO
// =====================================================

function obtenerClaveTema() {

    if (!usuarioActual) {
        return "beautymanager-tema";
    }

    return `beautymanager-tema-${usuarioActual.id}`;
}


function aplicarTema() {

    const temaGuardado =
        localStorage.getItem(obtenerClaveTema()) || "morado";


    document.documentElement.setAttribute(
        "data-tema",
        temaGuardado
    );


    document
        .querySelectorAll(".tema-opcion")
        .forEach((boton) => {

            boton.classList.toggle(
                "activo",
                boton.dataset.tema === temaGuardado
            );

        });

}


document
    .querySelectorAll(".tema-opcion")
    .forEach((boton) => {

        boton.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    obtenerClaveTema(),
                    boton.dataset.tema
                );

                aplicarTema();

            }
        );

    });
// =====================================================
// VERIFICAR SESIÓN
// =====================================================

async function verificarSesion() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {

        console.error("Error obteniendo la sesión:", error);

        window.location.href = "index.html";

        return;

    }

    if (!data.session) {

        window.location.href = "index.html";

        return;

    }

    usuarioActual = data.session.user;

    aplicarModoOscuro();
    aplicarTema();
    cargarDatosUsuario();

}
verificarSesion();

// =====================================================
// CARGAR INFORMACIÓN DEL USUARIO
// =====================================================

function cargarDatosUsuario() {

    if (!usuarioActual) return;


    const email =
        usuarioActual.email || "";


    // Correo de la cuenta

    if (correoCuenta) {

        correoCuenta.textContent =
            email;

    }


    // Correo del negocio

    if (correoNegocio) {

        correoNegocio.value =
            email;

    }


    // Metadata guardada en Supabase

    const datos =
        usuarioActual.user_metadata || {};


    if (nombreNegocio) {

        nombreNegocio.value =
            datos.nombreNegocio || "";

    }


    if (nombrePropietario) {

        nombrePropietario.value =
            datos.nombrePropietario ||
            datos.nombre ||
            "";

    }


    if (telefonoNegocio) {

        telefonoNegocio.value =
            datos.telefonoNegocio || "";

    }


    if (direccionNegocio) {

        direccionNegocio.value =
            datos.direccionNegocio || "";

    }


    if (descripcionNegocio) {

        descripcionNegocio.value =
            datos.descripcionNegocio || "";

    }


    // Inicial del usuario

    const nombre =
        datos.nombrePropietario ||
        datos.nombre ||
        email ||
        "U";


    if (usuarioInicial) {

        usuarioInicial.textContent =
            nombre.charAt(0).toUpperCase();

    }

}


// =====================================================
// GUARDAR DATOS DEL NEGOCIO
// =====================================================

if (formNegocio) {

    formNegocio.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            if (!usuarioActual) {

                alert(
                    "No hay una sesión activa."
                );

                return;

            }


            const nuevosDatos = {

                nombreNegocio:
                    nombreNegocio.value.trim(),

                nombrePropietario:
                    nombrePropietario.value.trim(),

                telefonoNegocio:
                    telefonoNegocio.value.trim(),

                direccionNegocio:
                    direccionNegocio.value.trim(),

                descripcionNegocio:
                    descripcionNegocio.value.trim()

            };


            const {
                data,
                error
            } = await supabase.auth.updateUser({

                data: nuevosDatos

            });


            if (error) {

                console.error(error);

                alert(
                    "No se pudieron guardar los cambios.\n\n" +
                    error.message
                );

                return;

            }


            usuarioActual =
                data.user;


            cargarDatosUsuario();


            alert(
                "✅ Datos del negocio guardados correctamente."
            );

        }
    );

}


// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================

if (formPassword) {

    formPassword.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            if (!usuarioActual) {

                alert(
                    "No hay una sesión activa."
                );

                return;

            }


            const actual =
                passwordActual.value.trim();

            const nueva =
                nuevaPassword.value.trim();

            const confirmar =
                confirmarPassword.value.trim();


            // Comprobar campos vacíos

            if (
                !actual ||
                !nueva ||
                !confirmar
            ) {

                alert(
                    "Completa todos los campos."
                );

                return;

            }


            // Mínimo 8 caracteres

            if (nueva.length < 8) {

                alert(
                    "La nueva contraseña debe tener mínimo 8 caracteres."
                );

                return;

            }


            // Comprobar coincidencia

            if (nueva !== confirmar) {

                alert(
                    "Las nuevas contraseñas no coinciden."
                );

                return;

            }


            // Evitar misma contraseña

            if (actual === nueva) {

                alert(
                    "La nueva contraseña debe ser diferente a la actual."
                );

                return;

            }


            // =================================================
            // COMPROBAR CONTRASEÑA ACTUAL
            // =================================================

            const {
                error: errorLogin
            } = await supabase.auth.signInWithPassword({

                email:
                    usuarioActual.email,

                password:
                    actual

            });


            if (errorLogin) {

                console.error(errorLogin);

                alert(
                    "❌ La contraseña actual es incorrecta."
                );

                return;

            }


            // =================================================
            // ACTUALIZAR CONTRASEÑA
            // =================================================

            const {
                error
            } = await supabase.auth.updateUser({

                password:
                    nueva

            });


            if (error) {

                console.error(error);

                alert(
                    "No se pudo cambiar la contraseña.\n\n" +
                    error.message
                );

                return;

            }


            alert(
                "✅ Contraseña cambiada correctamente."
            );


            // Limpiar campos

            passwordActual.value = "";

            nuevaPassword.value = "";

            confirmarPassword.value = "";


            actualizarFortaleza();

        }
    );

}


// =====================================================
// INDICADOR DE FORTALEZA
// =====================================================

if (nuevaPassword) {

    nuevaPassword.addEventListener(
        "input",
        actualizarFortaleza
    );

}


function actualizarFortaleza() {

    if (!nuevaPassword) return;


    const password =
        nuevaPassword.value;


    if (!password) {

        strengthProgress.style.width =
            "0%";

        strengthText.textContent =
            "Ingresa una contraseña";

        return;

    }


    let puntos = 0;


    // 8 caracteres

    if (password.length >= 8) {

        puntos++;

    }


    // Mayúscula

    if (/[A-Z]/.test(password)) {

        puntos++;

    }


    // Minúscula

    if (/[a-z]/.test(password)) {

        puntos++;

    }


    // Número

    if (/[0-9]/.test(password)) {

        puntos++;

    }


    // Símbolo

    if (/[^A-Za-z0-9]/.test(password)) {

        puntos++;

    }


    // Mostrar resultado

    if (puntos <= 1) {

        strengthProgress.style.width =
            "20%";

        strengthText.textContent =
            "Contraseña muy débil";

    }

    else if (puntos === 2) {

        strengthProgress.style.width =
            "40%";

        strengthText.textContent =
            "Contraseña débil";

    }

    else if (puntos === 3) {

        strengthProgress.style.width =
            "60%";

        strengthText.textContent =
            "Contraseña media";

    }

    else if (puntos === 4) {

        strengthProgress.style.width =
            "80%";

        strengthText.textContent =
            "Contraseña fuerte";

    }

    else {

        strengthProgress.style.width =
            "100%";

        strengthText.textContent =
            "Contraseña muy fuerte";

    }

}


// =====================================================
// MOSTRAR / OCULTAR CONTRASEÑAS
// =====================================================

const botonesPassword =
    document.querySelectorAll(
        ".mostrar-password"
    );


botonesPassword.forEach(
    (boton) => {

        boton.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        boton.dataset.target
                    );


                if (!input) return;


                if (
                    input.type === "password"
                ) {

                    input.type = "text";

                    boton.textContent =
                        "🙈";

                } else {

                    input.type =
                        "password";

                    boton.textContent =
                        "👁️";

                }

            }
        );

    }
);


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesionUsuario() {

    const confirmar =
        confirm(
            "¿Seguro que quieres cerrar sesión?"
        );


    if (!confirmar) return;


    const {
        error
    } = await supabase.auth.signOut();


    if (error) {

        console.error(error);

        alert(
            "No se pudo cerrar la sesión."
        );

        return;

    }


   localStorage.removeItem("beautymanager-usuario");

window.location.href =
    "index.html";

}


if (cerrarSesion) {

    cerrarSesion.addEventListener(
        "click",
        cerrarSesionUsuario
    );

}


if (cerrarSesionCuenta) {

    cerrarSesionCuenta.addEventListener(
        "click",
        cerrarSesionUsuario
    );

}


// =====================================================
// CAMBIAR DE CUENTA
// =====================================================

if (cambiarCuenta) {

    cambiarCuenta.addEventListener(
        "click",
        async () => {

            const confirmar =
                confirm(
                    "Se cerrará la sesión actual. ¿Quieres cambiar de cuenta?"
                );


            if (!confirmar) return;


            const {
                error
            } = await supabase.auth.signOut();


            if (error) {

                console.error(error);

                alert(
                    "No se pudo cerrar la sesión."
                );

                return;

            }

localStorage.removeItem("beautymanager-usuario");
            window.location.href =
                "index.html";

        }
    );

}