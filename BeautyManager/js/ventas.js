import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// =========================================
// SUPABASE
// =========================================

const SUPABASE_URL = "https://hxxvtporroqbwgwojubo.supabase.co";
const SUPABASE_KEY = "sb_publishable_GlZDWok98G3_cO5wLn-kuw_CGkGeXSQ";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================================
// ELEMENTOS
// =========================================

const cerrarSesion = document.getElementById("cerrarSesion");

const usuarioInicial = document.getElementById("usuarioInicial");

const ventaForm = document.getElementById("ventaForm");

const clienteVenta = document.getElementById("clienteVenta");

const productoVenta = document.getElementById("productoVenta");

const cantidadVenta = document.getElementById("cantidadVenta");

const metodoPago = document.getElementById("metodoPago");

const precioVenta = document.getElementById("precioVenta");

const totalVenta = document.getElementById("totalVenta");

const stockDisponible = document.getElementById("stockDisponible");

const ventaMensaje = document.getElementById("ventaMensaje");

const listaVentas = document.getElementById("listaVentas");

const buscarVenta = document.getElementById("buscarVenta");

const filtroMetodo = document.getElementById("filtroMetodo");

const totalVendido = document.getElementById("totalVendido");

const cantidadVentas = document.getElementById("cantidadVentas");

const promedioVenta = document.getElementById("promedioVenta");


// =========================================
// DATOS
// =========================================

let usuarioActual = null;

let productos = [];

let clientes = [];

let ventas = [];


// =========================================
// FORMATO DE DINERO
// =========================================

function formatoPrecio(valor) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }
    ).format(valor || 0);

}


// =========================================
// INICIAR
// =========================================

async function iniciarVentas() {

    const {
        data,
        error
    } = await supabase.auth.getSession();


    if (error) {

        console.error(error);

        return;

    }


    if (!data.session) {

        window.location.href = "index.html";

        return;

    }


    usuarioActual = data.session.user;


    // Inicial del usuario

    const nombreUsuario =
        usuarioActual.user_metadata?.nombre ||
        usuarioActual.user_metadata?.name ||
        usuarioActual.email ||
        "U";


    usuarioInicial.textContent =
        nombreUsuario
            .charAt(0)
            .toUpperCase();


    await cargarClientes();

    await cargarProductos();

    await cargarVentas();

}


// =========================================
// CERRAR SESIÓN
// =========================================

cerrarSesion.addEventListener(
    "click",
    async () => {

        const {
            error
        } = await supabase.auth.signOut();


        if (error) {

            alert(
                "No se pudo cerrar sesión."
            );

            return;

        }


        window.location.href = "index.html";

    }
);


// =========================================
// CARGAR CLIENTES
// =========================================

async function cargarClientes() {

    const {
        data,
        error
    } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", usuarioActual.id)
        .order("nombre", {
            ascending: true
        });


    if (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        return;

    }


    clientes = data || [];


    clienteVenta.innerHTML = `
        <option value="">
            Selecciona un cliente
        </option>
    `;


    clientes.forEach(cliente => {

        const option =
            document.createElement("option");


        option.value = cliente.id;

        option.textContent =
            cliente.nombre;


        clienteVenta.appendChild(option);

    });

}


// =========================================
// CARGAR PRODUCTOS
// =========================================

async function cargarProductos() {

    const {
        data,
        error
    } = await supabase
        .from("productos")
        .select("*")
        .eq("user_id", usuarioActual.id)
        .order("nombre", {
            ascending: true
        });


    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        return;

    }


    productos = data || [];


    productoVenta.innerHTML = `
        <option value="">
            Selecciona un producto
        </option>
    `;


    productos.forEach(producto => {

        const option =
            document.createElement("option");


        option.value = producto.id;

        option.textContent =
            `${producto.nombre} — ${formatoPrecio(producto.precio)}`;


        productoVenta.appendChild(option);

    });

}


// =========================================
// CUANDO SE SELECCIONA PRODUCTO
// =========================================

productoVenta.addEventListener(
    "change",
    actualizarProducto
);


cantidadVenta.addEventListener(
    "input",
    calcularTotal
);


function actualizarProducto() {

    const producto =
        productos.find(
            p => String(p.id) === productoVenta.value
        );


    if (!producto) {

        precioVenta.textContent =
            formatoPrecio(0);

        stockDisponible.textContent =
            "Selecciona un producto";

        totalVenta.textContent =
            formatoPrecio(0);

        return;

    }


    precioVenta.textContent =
        formatoPrecio(producto.precio);


    stockDisponible.textContent =
        `Stock disponible: ${producto.stock}`;


    cantidadVenta.max =
        producto.stock;


    calcularTotal();

}


// =========================================
// CALCULAR TOTAL
// =========================================

function calcularTotal() {

    const producto =
        productos.find(
            p => String(p.id) === productoVenta.value
        );


    if (!producto) {

        totalVenta.textContent =
            formatoPrecio(0);

        return;

    }


    const cantidad =
        Number(cantidadVenta.value) || 0;


    const total =
        Number(producto.precio) * cantidad;


    totalVenta.textContent =
        formatoPrecio(total);

}


// =========================================
// REGISTRAR VENTA
// =========================================

ventaForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        ventaMensaje.textContent =
            "Registrando venta...";


        ventaMensaje.style.color =
            "#93868d";


        const producto =
            productos.find(
                p => String(p.id) === productoVenta.value
            );


        const cliente =
            clientes.find(
                c => String(c.id) === clienteVenta.value
            );


        const cantidad =
            Number(cantidadVenta.value);


        if (!cliente) {

            ventaMensaje.textContent =
                "Selecciona un cliente.";

            ventaMensaje.style.color =
                "#c34c4c";

            return;

        }


        if (!producto) {

            ventaMensaje.textContent =
                "Selecciona un producto.";

            ventaMensaje.style.color =
                "#c34c4c";

            return;

        }


        if (!cantidad || cantidad < 1) {

            ventaMensaje.textContent =
                "La cantidad debe ser mayor a 0.";

            ventaMensaje.style.color =
                "#c34c4c";

            return;

        }


        if (cantidad > producto.stock) {

            ventaMensaje.textContent =
                `No hay suficiente stock. Disponible: ${producto.stock}.`;

            ventaMensaje.style.color =
                "#c34c4c";

            return;

        }


        const precio =
            Number(producto.precio);


        const total =
            precio * cantidad;


        // =====================================
        // GUARDAR VENTA
        // =====================================

        const {
            data: nuevaVenta,
            error
        } = await supabase
            .from("ventas")
            .insert([
                {
                    user_id: usuarioActual.id,
                    cliente_id: cliente.id,
                    producto_id: producto.id,
                    cantidad: cantidad,
                    precio_unitario: precio,
                    total: total,
                    metodo_pago: metodoPago.value
                }
            ])
            .select()
            .single();


        if (error) {

            console.error(error);

            ventaMensaje.textContent =
                "No se pudo registrar la venta.";

            ventaMensaje.style.color =
                "#c34c4c";

            return;

        }


        // =====================================
        // DESCONTAR STOCK
        // =====================================

        const nuevoStock =
            Number(producto.stock) - cantidad;


        const {
            error: stockError
        } = await supabase
            .from("productos")
            .update({
                stock: nuevoStock
            })
            .eq("id", producto.id)
            .eq("user_id", usuarioActual.id);


        if (stockError) {

            console.error(
                "Error actualizando stock:",
                stockError
            );

        }


        ventaMensaje.textContent =
            "¡Venta registrada correctamente!";


        ventaMensaje.style.color =
            "#25834d";


        ventaForm.reset();


        precioVenta.textContent =
            formatoPrecio(0);


        totalVenta.textContent =
            formatoPrecio(0);


        stockDisponible.textContent =
            "Selecciona un producto";


        cantidadVenta.value = 1;


        await cargarProductos();

        await cargarVentas();

    }
);


// =========================================
// CARGAR VENTAS
// =========================================

async function cargarVentas() {

    const {
        data,
        error
    } = await supabase
        .from("ventas")
        .select(`
            *,
            clientes (
                nombre
            ),
            productos (
                nombre
            )
        `)
        .eq("user_id", usuarioActual.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Error cargando ventas:",
            error
        );

        listaVentas.innerHTML =
            `<p class="ventas-vacio">
                No se pudieron cargar las ventas.
            </p>`;

        return;

    }


    ventas = data || [];


    actualizarResumen();

    mostrarVentas();

}


// =========================================
// RESUMEN
// =========================================

function actualizarResumen() {

    const cantidad =
        ventas.length;


    const total =
        ventas.reduce(
            (suma, venta) =>
                suma + Number(venta.total),
            0
        );


    const promedio =
        cantidad > 0
            ? total / cantidad
            : 0;


    totalVendido.textContent =
        formatoPrecio(total);


    cantidadVentas.textContent =
        cantidad;


    promedioVenta.textContent =
        formatoPrecio(promedio);

}


// =========================================
// MOSTRAR VENTAS
// =========================================

function mostrarVentas() {

    const texto =
        buscarVenta.value
            .toLowerCase()
            .trim();


    const metodo =
        filtroMetodo.value;


    const filtradas =
        ventas.filter(venta => {


            const nombreCliente =
                venta.clientes?.nombre
                    ?.toLowerCase() || "";


            const nombreProducto =
                venta.productos?.nombre
                    ?.toLowerCase() || "";


            const coincideTexto =
                nombreCliente.includes(texto) ||
                nombreProducto.includes(texto) ||
                String(venta.id).includes(texto);


            const coincideMetodo =
                metodo === "Todos" ||
                venta.metodo_pago === metodo;


            return (
                coincideTexto &&
                coincideMetodo
            );

        });


    if (filtradas.length === 0) {

        listaVentas.innerHTML = `
            <div class="ventas-vacio">
                <div>🧾</div>
                <h3>No hay ventas</h3>
                <p>
                    Todavía no tienes ventas que mostrar.
                </p>
            </div>
        `;

        return;

    }


    listaVentas.innerHTML = "";


    filtradas.forEach(venta => {

        const fecha =
            new Date(
                venta.created_at
            ).toLocaleDateString(
                "es-CO",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );


        const hora =
            new Date(
                venta.created_at
            ).toLocaleTimeString(
                "es-CO",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        const cliente =
            venta.clientes?.nombre ||
            "Cliente eliminado";


        const producto =
            venta.productos?.nombre ||
            "Producto eliminado";


        const card =
            document.createElement("div");


        card.className =
            "venta-item";


        card.innerHTML = `

            <div class="venta-item-info">

                <div class="venta-item-icon">
                    💰
                </div>

                <div>

                    <h3>
                        ${producto}
                    </h3>

                    <p>
                        Cliente: ${cliente}
                    </p>

                    <p>
                        ${fecha} · ${hora}
                    </p>

                </div>

            </div>


            <div class="venta-item-detalles">

                <span class="venta-cantidad">
                    ${venta.cantidad} unidad(es)
                </span>

                <span class="venta-metodo">
                    ${venta.metodo_pago}
                </span>

                <strong>
                    ${formatoPrecio(venta.total)}
                </strong>

                <button
                    class="btn-eliminar-venta"
                    data-id="${venta.id}"
                >
                    Eliminar
                </button>

            </div>

        `;


        listaVentas.appendChild(card);

    });


    document
        .querySelectorAll(".btn-eliminar-venta")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    eliminarVenta(
                        button.dataset.id
                    );

                }
            );

        });

}


// =========================================
// ELIMINAR VENTA
// =========================================

async function eliminarVenta(id) {

    const venta =
        ventas.find(
            v => String(v.id) === String(id)
        );


    if (!venta) return;


    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar esta venta? El stock será devuelto al producto."
        );


    if (!confirmar) return;


    // =====================================
    // DEVOLVER STOCK
    // =====================================

    if (venta.producto_id) {

        const {
            data: producto,
            error: productoError
        } = await supabase
            .from("productos")
            .select("stock")
            .eq("id", venta.producto_id)
            .eq("user_id", usuarioActual.id)
            .maybeSingle();


        if (
            !productoError &&
            producto
        ) {

            const stockRestaurado =
                Number(producto.stock) +
                Number(venta.cantidad);


            await supabase
                .from("productos")
                .update({
                    stock: stockRestaurado
                })
                .eq("id", venta.producto_id)
                .eq("user_id", usuarioActual.id);

        }

    }


    // =====================================
    // ELIMINAR
    // =====================================

    const {
        error
    } = await supabase
        .from("ventas")
        .delete()
        .eq("id", id)
        .eq("user_id", usuarioActual.id);


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar la venta."
        );

        return;

    }


    await cargarProductos();

    await cargarVentas();

}


// =========================================
// BUSCAR
// =========================================

buscarVenta.addEventListener(
    "input",
    mostrarVentas
);


// =========================================
// FILTRAR
// =========================================

filtroMetodo.addEventListener(
    "change",
    mostrarVentas
);


// =========================================
// INICIAR
// =========================================

iniciarVentas();