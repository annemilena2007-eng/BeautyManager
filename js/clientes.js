import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ======================================
// CONEXIÓN CON SUPABASE
// ======================================

const SUPABASE_URL = "https://hxxvtporroqbwgwojubo.supabase.co";
const SUPABASE_KEY = "sb_publishable_GlZDWok98G3_cO5wLn-kuw_CGkGeXSQ";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================
// ELEMENTOS
// ======================================

const clienteForm = document.getElementById("clienteForm");
const clienteMensaje = document.getElementById("clienteMensaje");
const listaClientes = document.getElementById("listaClientes");
const cerrarSesion = document.getElementById("cerrarSesion");

const buscarCliente = document.getElementById("buscarCliente");

const modalEditarCliente =
    document.getElementById("modalEditarCliente");

const cerrarModalCliente =
    document.getElementById("cerrarModalCliente");

const cancelarEdicionCliente =
    document.getElementById("cancelarEdicionCliente");

const editarClienteForm =
    document.getElementById("editarClienteForm");


// ======================================
// COMPROBAR SESIÓN
// ======================================

const {
    data: { session }
} = await supabase.auth.getSession();

if (!session) {
    window.location.href = "index.html";
}


// ======================================
// CERRAR SESIÓN
// ======================================

if (cerrarSesion) {

    cerrarSesion.addEventListener("click", async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error(error);
            return;
        }

        window.location.href = "index.html";

    });

}


// ======================================
// GUARDAR CLIENTES EN MEMORIA
// ======================================

let clientesGuardados = [];


// ======================================
// AGREGAR CLIENTE
// ======================================

if (clienteForm) {

    clienteForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nombre =
            document
                .getElementById("nombreCliente")
                .value
                .trim();

        const telefono =
            document
                .getElementById("telefonoCliente")
                .value
                .trim();

        const correo =
            document
                .getElementById("correoCliente")
                .value
                .trim();

        const direccion =
            document
                .getElementById("direccionCliente")
                .value
                .trim();

        const notas =
            document
                .getElementById("notasCliente")
                .value
                .trim();


        clienteMensaje.textContent =
            "Guardando cliente...";


        const {
            data: { user }
        } = await supabase.auth.getUser();


        if (!user) {

            clienteMensaje.textContent =
                "Tu sesión ha expirado. Inicia sesión nuevamente.";

            return;
        }


        const { error } =
            await supabase
                .from("clientes")
                .insert({

                    user_id: user.id,
                    nombre: nombre,
                    telefono: telefono,
                    correo: correo,
                    direccion: direccion,
                    notas: notas

                });


        if (error) {

            console.error(error);

            clienteMensaje.textContent =
                "No se pudo guardar el cliente.";

            return;
        }


        clienteMensaje.textContent =
            "¡Cliente guardado correctamente! 💗";


        clienteForm.reset();


        cargarClientes();

    });

}


// ======================================
// CARGAR CLIENTES
// ======================================

async function cargarClientes() {

    listaClientes.textContent =
        "Cargando clientes...";


    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {

        window.location.href = "index.html";

        return;
    }


    const { data: clientes, error } =
        await supabase
            .from("clientes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        listaClientes.textContent =
            "No se pudieron cargar los clientes.";

        return;
    }


    clientesGuardados = clientes || [];

    mostrarClientes(clientesGuardados);

}


// ======================================
// MOSTRAR CLIENTES
// ======================================

function mostrarClientes(clientes) {

    if (!clientes || clientes.length === 0) {

        listaClientes.innerHTML =
            "<p>Aún no tienes clientes registrados.</p>";

        return;
    }


    listaClientes.innerHTML = "";


    clientes.forEach((cliente) => {

        const clienteDiv =
            document.createElement("div");


        clienteDiv.className =
            "producto-item";


        clienteDiv.innerHTML = `

            <div class="producto-info">

                <h3>
                    ${cliente.nombre}
                </h3>

                <p>
                    📱 Teléfono:
                    ${cliente.telefono || "No registrado"}
                </p>

                <p>
                    📧 Correo:
                    ${cliente.correo || "No registrado"}
                </p>

                <p>
                    📍 Dirección:
                    ${cliente.direccion || "No registrada"}
                </p>

                ${
                    cliente.notas
                        ? `
                            <p>
                                📝 Notas:
                                ${cliente.notas}
                            </p>
                          `
                        : ""
                }

            </div>


            <div class="producto-acciones">

                <button
                    class="btn-editar btn-editar-cliente"
                    data-id="${cliente.id}"
                >
                    ✏️ Editar
                </button>


                <button
                    class="btn-eliminar btn-eliminar-cliente"
                    data-id="${cliente.id}"
                >
                    🗑️ Eliminar
                </button>

            </div>

            <hr>

        `;


        listaClientes.appendChild(clienteDiv);

    });


    // ==================================
    // BOTONES EDITAR
    // ==================================

    document
        .querySelectorAll(".btn-editar-cliente")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                const id = boton.dataset.id;

                abrirEditarCliente(id);

            });

        });


    // ==================================
    // BOTONES ELIMINAR
    // ==================================

    document
        .querySelectorAll(".btn-eliminar-cliente")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                const id = boton.dataset.id;

                eliminarCliente(id);

            });

        });

}


// ======================================
// BUSCAR CLIENTES
// ======================================

if (buscarCliente) {

    buscarCliente.addEventListener("input", () => {

        const texto =
            buscarCliente.value
                .toLowerCase()
                .trim();


        const clientesFiltrados =
            clientesGuardados.filter((cliente) => {

                return (

                    cliente.nombre
                        .toLowerCase()
                        .includes(texto)

                    ||

                    (cliente.telefono || "")
                        .toLowerCase()
                        .includes(texto)

                    ||

                    (cliente.correo || "")
                        .toLowerCase()
                        .includes(texto)

                );

            });


        mostrarClientes(clientesFiltrados);

    });

}


// ======================================
// ABRIR EDICIÓN
// ======================================

function abrirEditarCliente(id) {

    const cliente =
        clientesGuardados.find(
            (item) =>
                String(item.id) === String(id)
        );


    if (!cliente) {
        return;
    }


    document.getElementById(
        "editarClienteId"
    ).value = cliente.id;


    document.getElementById(
        "editarNombreCliente"
    ).value = cliente.nombre;


    document.getElementById(
        "editarTelefonoCliente"
    ).value = cliente.telefono || "";


    document.getElementById(
        "editarCorreoCliente"
    ).value = cliente.correo || "";


    document.getElementById(
        "editarDireccionCliente"
    ).value = cliente.direccion || "";


    document.getElementById(
        "editarNotasCliente"
    ).value = cliente.notas || "";


    modalEditarCliente.style.display =
        "flex";

}


// ======================================
// CERRAR MODAL
// ======================================

function cerrarModalEditarCliente() {

    modalEditarCliente.style.display =
        "none";

}


if (cerrarModalCliente) {

    cerrarModalCliente.addEventListener(
        "click",
        cerrarModalEditarCliente
    );

}


if (cancelarEdicionCliente) {

    cancelarEdicionCliente.addEventListener(
        "click",
        cerrarModalEditarCliente
    );

}


// ======================================
// GUARDAR CAMBIOS
// ======================================

if (editarClienteForm) {

    editarClienteForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editarClienteId"
                ).value;


            const nombre =
                document.getElementById(
                    "editarNombreCliente"
                ).value.trim();


            const telefono =
                document.getElementById(
                    "editarTelefonoCliente"
                ).value.trim();


            const correo =
                document.getElementById(
                    "editarCorreoCliente"
                ).value.trim();


            const direccion =
                document.getElementById(
                    "editarDireccionCliente"
                ).value.trim();


            const notas =
                document.getElementById(
                    "editarNotasCliente"
                ).value.trim();


            const {
                data: { user }
            } = await supabase.auth.getUser();


            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            const { error } =
                await supabase
                    .from("clientes")
                    .update({

                        nombre: nombre,
                        telefono: telefono,
                        correo: correo,
                        direccion: direccion,
                        notas: notas

                    })
                    .eq("id", id)
                    .eq("user_id", user.id);


            if (error) {

                console.error(error);

                alert(
                    "No se pudieron guardar los cambios."
                );

                return;
            }


            alert(
                "¡Cliente actualizado correctamente! 💗"
            );


            cerrarModalEditarCliente();

            cargarClientes();

        }
    );

}


// ======================================
// ELIMINAR CLIENTE
// ======================================

async function eliminarCliente(id) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar este cliente?"
        );


    if (!confirmar) {
        return;
    }


    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {

        window.location.href =
            "index.html";

        return;
    }


    const { error } =
        await supabase
            .from("clientes")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el cliente."
        );

        return;
    }


    alert(
        "Cliente eliminado correctamente. 🗑️"
    );


    cargarClientes();

}


// ======================================
// CARGAR AL ABRIR
// ======================================

cargarClientes();