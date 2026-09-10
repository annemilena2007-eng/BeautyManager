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

const pedidoForm = document.getElementById("pedidoForm");
const pedidoMensaje = document.getElementById("pedidoMensaje");

const clientePedido = document.getElementById("clientePedido");
const productoPedido = document.getElementById("productoPedido");
const cantidadPedido = document.getElementById("cantidadPedido");
const estadoPedido = document.getElementById("estadoPedido");
const totalPedido = document.getElementById("totalPedido");

const listaPedidos = document.getElementById("listaPedidos");

const buscarPedido = document.getElementById("buscarPedido");
const filtroEstado = document.getElementById("filtroEstado");

const cerrarSesion = document.getElementById("cerrarSesion");

const modalEditarPedido =
    document.getElementById("modalEditarPedido");

const cerrarModalPedido =
    document.getElementById("cerrarModalPedido");

const cancelarEdicionPedido =
    document.getElementById("cancelarEdicionPedido");

const editarPedidoForm =
    document.getElementById("editarPedidoForm");


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
// VARIABLES
// ======================================

let clientesGuardados = [];
let productosGuardados = [];
let pedidosGuardados = [];


// ======================================
// CARGAR CLIENTES
// ======================================

async function cargarClientes() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }


    const { data, error } =
        await supabase
            .from("clientes")
            .select("*")
            .eq("user_id", user.id)
            .order("nombre", {
                ascending: true
            });


    if (error) {

        console.error(error);

        return;
    }


    clientesGuardados = data || [];


    clientePedido.innerHTML =
        `<option value="">
            Selecciona un cliente
        </option>`;


    clientesGuardados.forEach((cliente) => {

        const option =
            document.createElement("option");

        option.value = cliente.id;

        option.textContent =
            cliente.nombre;

        clientePedido.appendChild(option);

    });

}


// ======================================
// CARGAR PRODUCTOS
// ======================================

async function cargarProductos() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }


    const { data, error } =
        await supabase
            .from("productos")
            .select("*")
            .eq("user_id", user.id)
            .order("nombre", {
                ascending: true
            });


    if (error) {

        console.error(error);

        return;
    }


    productosGuardados = data || [];


    productoPedido.innerHTML =
        `<option value="">
            Selecciona un producto
        </option>`;


    productosGuardados.forEach((producto) => {

        const option =
            document.createElement("option");

        option.value = producto.id;

        option.textContent =
            `${producto.nombre} — $${Number(
                producto.precio
            ).toLocaleString("es-CO")}`;

        productoPedido.appendChild(option);

    });

}


// ======================================
// CALCULAR TOTAL
// ======================================

function calcularTotal() {

    const productoId =
        productoPedido.value;

    const cantidad =
        Number(cantidadPedido.value) || 0;


    const producto =
        productosGuardados.find(
            (item) =>
                String(item.id) === String(productoId)
        );


    if (!producto || cantidad <= 0) {

        totalPedido.textContent = "$0";

        return;
    }


    const total =
        Number(producto.precio) * cantidad;


    totalPedido.textContent =
        `$${total.toLocaleString("es-CO")}`;

}


// ======================================
// ACTUALIZAR TOTAL
// ======================================

productoPedido.addEventListener(
    "change",
    calcularTotal
);

cantidadPedido.addEventListener(
    "input",
    calcularTotal
);


// ======================================
// CREAR PEDIDO
// ======================================

if (pedidoForm) {

    pedidoForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const clienteId =
                clientePedido.value;

            const productoId =
                productoPedido.value;

            const cantidad =
                Number(cantidadPedido.value);

            const estado =
                estadoPedido.value;


            const producto =
                productosGuardados.find(
                    (item) =>
                        String(item.id) ===
                        String(productoId)
                );


            if (!producto) {

                pedidoMensaje.textContent =
                    "Selecciona un producto.";

                return;
            }


            if (cantidad <= 0) {

                pedidoMensaje.textContent =
                    "La cantidad debe ser mayor a 0.";

                return;
            }


            if (cantidad > producto.stock) {

                pedidoMensaje.textContent =
                    `No hay suficiente stock. Solo quedan ${producto.stock} unidades.`;

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


            const precioUnitario =
                Number(producto.precio);


            const total =
                precioUnitario * cantidad;


            pedidoMensaje.textContent =
                "Creando pedido...";


            const { error } =
                await supabase
                    .from("pedidos")
                    .insert({

                        user_id: user.id,
                        cliente_id: Number(clienteId),
                        producto_id: Number(productoId),
                        cantidad: cantidad,
                        precio_unitario: precioUnitario,
                        total: total,
                        estado: estado

                    });


            if (error) {

                console.error(error);

                pedidoMensaje.textContent =
                    "No se pudo crear el pedido.";

                return;
            }


            // ==================================
            // DESCONTAR STOCK
            // ==================================

            const nuevoStock =
                producto.stock - cantidad;


            const { error: stockError } =
                await supabase
                    .from("productos")
                    .update({
                        stock: nuevoStock
                    })
                    .eq("id", producto.id)
                    .eq("user_id", user.id);


            if (stockError) {

                console.error(stockError);

            }


            pedidoMensaje.textContent =
                "¡Pedido creado correctamente! 💗";


            pedidoForm.reset();

            totalPedido.textContent =
                "$0";


            await cargarProductos();

            cargarPedidos();

        }
    );

}


// ======================================
// CARGAR PEDIDOS
// ======================================

async function cargarPedidos() {

    listaPedidos.textContent =
        "Cargando pedidos...";


    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {

        window.location.href =
            "index.html";

        return;
    }


    const { data, error } =
        await supabase
            .from("pedidos")
            .select(`
                *,
                clientes (
                    nombre,
                    telefono
                ),
                productos (
                    nombre
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        listaPedidos.textContent =
            "No se pudieron cargar los pedidos.";

        return;
    }


    pedidosGuardados = data || [];

    mostrarPedidos(pedidosGuardados);

}


// ======================================
// MOSTRAR PEDIDOS
// ======================================

function mostrarPedidos(pedidos) {

    if (!pedidos || pedidos.length === 0) {

        listaPedidos.innerHTML =
            "<p>Aún no tienes pedidos registrados.</p>";

        return;
    }


    listaPedidos.innerHTML = "";


    pedidos.forEach((pedido) => {

        const pedidoDiv =
            document.createElement("div");


        pedidoDiv.className =
            "producto-item";


        const nombreCliente =
            pedido.clientes?.nombre ||
            "Cliente eliminado";


        const nombreProducto =
            pedido.productos?.nombre ||
            "Producto eliminado";


        const fecha =
            new Date(
                pedido.created_at
            ).toLocaleDateString("es-CO");


        let claseEstado =
            "estado-pendiente";


        if (pedido.estado === "Procesando") {
            claseEstado = "estado-procesando";
        }

        if (pedido.estado === "Enviado") {
            claseEstado = "estado-enviado";
        }

        if (pedido.estado === "Entregado") {
            claseEstado = "estado-entregado";
        }


        pedidoDiv.innerHTML = `

            <div class="producto-info">

                <h3>
                    Pedido #${pedido.id}
                </h3>

                <p>
                    👤 Cliente:
                    <strong>${nombreCliente}</strong>
                </p>

                <p>
                    💄 Producto:
                    <strong>${nombreProducto}</strong>
                </p>

                <p>
                    🔢 Cantidad:
                    ${pedido.cantidad}
                </p>

                <p>
                    💰 Total:
                    <strong>
                        $${Number(pedido.total)
                            .toLocaleString("es-CO")}
                    </strong>
                </p>

                <p>
                    📅 Fecha:
                    ${fecha}
                </p>

                <p>
                    Estado:
                    <span class="${claseEstado}">
                        ${pedido.estado}
                    </span>
                </p>

            </div>


            <div class="producto-acciones">

                <button
                    class="btn-editar btn-editar-pedido"
                    data-id="${pedido.id}"
                >
                    ✏️ Estado
                </button>


                <button
                    class="btn-eliminar btn-eliminar-pedido"
                    data-id="${pedido.id}"
                >
                    🗑️ Eliminar
                </button>

            </div>

            <hr>

        `;


        listaPedidos.appendChild(pedidoDiv);

    });


    // ==================================
    // EDITAR ESTADO
    // ==================================

    document
        .querySelectorAll(".btn-editar-pedido")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                abrirEditarPedido(
                    boton.dataset.id
                );

            });

        });


    // ==================================
    // ELIMINAR
    // ==================================

    document
        .querySelectorAll(".btn-eliminar-pedido")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                eliminarPedido(
                    boton.dataset.id
                );

            });

        });

}


// ======================================
// BUSCAR PEDIDOS
// ======================================

if (buscarPedido) {

    buscarPedido.addEventListener(
        "input",
        aplicarFiltros
    );

}


if (filtroEstado) {

    filtroEstado.addEventListener(
        "change",
        aplicarFiltros
    );

}


function aplicarFiltros() {

    const texto =
        buscarPedido.value
            .toLowerCase()
            .trim();


    const estado =
        filtroEstado.value;


    const filtrados =
        pedidosGuardados.filter((pedido) => {

            const cliente =
                pedido.clientes?.nombre ||
                "";


            const producto =
                pedido.productos?.nombre ||
                "";


            const coincideTexto =

                cliente
                    .toLowerCase()
                    .includes(texto)

                ||

                producto
                    .toLowerCase()
                    .includes(texto)

                ||

                String(pedido.id)
                    .includes(texto);


            const coincideEstado =
                estado === "Todos" ||
                pedido.estado === estado;


            return (
                coincideTexto &&
                coincideEstado
            );

        });


    mostrarPedidos(filtrados);

}


// ======================================
// ABRIR MODAL DE EDICIÓN
// ======================================

function abrirEditarPedido(id) {

    const pedido =
        pedidosGuardados.find(
            (item) =>
                String(item.id) === String(id)
        );


    if (!pedido) {
        return;
    }


    document.getElementById(
        "editarPedidoId"
    ).value = pedido.id;


    document.getElementById(
        "editarEstadoPedido"
    ).value = pedido.estado;


    modalEditarPedido.style.display =
        "flex";

}


// ======================================
// CERRAR MODAL
// ======================================

function cerrarModalEditarPedido() {

    modalEditarPedido.style.display =
        "none";

}


if (cerrarModalPedido) {

    cerrarModalPedido.addEventListener(
        "click",
        cerrarModalEditarPedido
    );

}


if (cancelarEdicionPedido) {

    cancelarEdicionPedido.addEventListener(
        "click",
        cerrarModalEditarPedido
    );

}


// ======================================
// GUARDAR NUEVO ESTADO
// ======================================

if (editarPedidoForm) {

    editarPedidoForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editarPedidoId"
                ).value;


            const estado =
                document.getElementById(
                    "editarEstadoPedido"
                ).value;


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
                    .from("pedidos")
                    .update({
                        estado: estado
                    })
                    .eq("id", id)
                    .eq("user_id", user.id);


            if (error) {

                console.error(error);

                alert(
                    "No se pudo actualizar el estado."
                );

                return;
            }


            alert(
                "¡Estado actualizado correctamente! 💗"
            );


            cerrarModalEditarPedido();

            cargarPedidos();

        }
    );

}


// ======================================
// ELIMINAR PEDIDO
// ======================================

async function eliminarPedido(id) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar este pedido?"
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
            .from("pedidos")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el pedido."
        );

        return;
    }


    alert(
        "Pedido eliminado correctamente. 🗑️"
    );


    cargarPedidos();

}


// ======================================
// INICIAR
// ======================================

await cargarClientes();

await cargarProductos();

await cargarPedidos();