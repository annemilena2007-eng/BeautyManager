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

const cerrarSesion =
    document.getElementById("cerrarSesion");

const usuarioInicial =
    document.getElementById("usuarioInicial");

const estadisticaVentas =
    document.getElementById("estadisticaVentas");

const estadisticaCantidadVentas =
    document.getElementById("estadisticaCantidadVentas");

const estadisticaProductos =
    document.getElementById("estadisticaProductos");

const estadisticaClientes =
    document.getElementById("estadisticaClientes");

const graficoVentas =
    document.getElementById("graficoVentas");

const productosMasVendidos =
    document.getElementById("productosMasVendidos");

const metodosPagoEstadistica =
    document.getElementById("metodosPagoEstadistica");

const productosStockBajo =
    document.getElementById("productosStockBajo");


// =========================================
// VARIABLES
// =========================================

let usuarioActual = null;

let ventas = [];

let productos = [];

let clientes = [];


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

async function iniciarEstadisticas() {

    const {
        data,
        error
    } = await supabase.auth.getSession();


    if (error) {

        console.error(error);

        return;

    }


    if (!data.session) {

        window.location.href =
            "index.html";

        return;

    }


    usuarioActual =
        data.session.user;


    const nombreUsuario =
        usuarioActual.user_metadata?.nombre ||
        usuarioActual.user_metadata?.name ||
        usuarioActual.email ||
        "U";


    usuarioInicial.textContent =
        nombreUsuario
            .charAt(0)
            .toUpperCase();


    await cargarDatos();

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


        window.location.href =
            "index.html";

    }
);


// =========================================
// CARGAR TODOS LOS DATOS
// =========================================

async function cargarDatos() {

    await Promise.all([
        cargarVentas(),
        cargarProductos(),
        cargarClientes()
    ]);


    mostrarResumen();

    mostrarGraficoVentas();

    mostrarProductosMasVendidos();

    mostrarMetodosPago();

    mostrarStockBajo();

}


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
            productos (
                nombre
            )
        `)
        .eq(
            "user_id",
            usuarioActual.id
        );


    if (error) {

        console.error(
            "Error cargando ventas:",
            error
        );

        return;

    }


    ventas = data || [];

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
        .eq(
            "user_id",
            usuarioActual.id
        )
        .order(
            "stock",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        return;

    }


    productos = data || [];

}


// =========================================
// CARGAR CLIENTES
// =========================================

async function cargarClientes() {

    const {
        data,
        error
    } = await supabase
        .from("clientes")
        .select("id")
        .eq(
            "user_id",
            usuarioActual.id
        );


    if (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        return;

    }


    clientes = data || [];

}


// =========================================
// RESUMEN
// =========================================

function mostrarResumen() {

    const total =
        ventas.reduce(
            (suma, venta) =>
                suma + Number(venta.total),
            0
        );


    const cantidadVentas =
        ventas.length;


    const productosVendidos =
        ventas.reduce(
            (suma, venta) =>
                suma + Number(venta.cantidad),
            0
        );


    estadisticaVentas.textContent =
        formatoPrecio(total);


    estadisticaCantidadVentas.textContent =
        cantidadVentas;


    estadisticaProductos.textContent =
        productosVendidos;


    estadisticaClientes.textContent =
        clientes.length;

}


// =========================================
// GRÁFICO DE LOS ÚLTIMOS 7 DÍAS
// =========================================

function mostrarGraficoVentas() {

    const dias = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const fecha =
            new Date();


        fecha.setHours(
            0,
            0,
            0,
            0
        );


        fecha.setDate(
            fecha.getDate() - i
        );


        dias.push(fecha);

    }


    graficoVentas.innerHTML = "";


    const ventasPorDia =
        dias.map(fecha => {


            const siguiente =
                new Date(fecha);


            siguiente.setDate(
                siguiente.getDate() + 1
            );


            const total =
                ventas
                    .filter(venta => {

                        const fechaVenta =
                            new Date(
                                venta.created_at
                            );


                        return (
                            fechaVenta >= fecha &&
                            fechaVenta < siguiente
                        );

                    })
                    .reduce(
                        (suma, venta) =>
                            suma +
                            Number(venta.total),
                        0
                    );


            return {
                fecha,
                total
            };

        });


    const maximo =
        Math.max(
            ...ventasPorDia.map(
                dia => dia.total
            ),
            1
        );


    ventasPorDia.forEach(dia => {

        const columna =
            document.createElement("div");


        columna.className =
            "grafico-columna";


        const barra =
            document.createElement("div");


        barra.className =
            "grafico-barra";


        const porcentaje =
            (dia.total / maximo) * 100;


        barra.style.height =
            `${Math.max(porcentaje, 4)}%`;


        barra.title =
            formatoPrecio(dia.total);


        const valor =
            document.createElement("span");


        valor.className =
            "grafico-valor";


        valor.textContent =
            dia.total > 0
                ? formatoPrecio(dia.total)
                : "$0";


        const etiqueta =
            document.createElement("span");


        etiqueta.className =
            "grafico-etiqueta";


        etiqueta.textContent =
            dia.fecha.toLocaleDateString(
                "es-CO",
                {
                    weekday: "short"
                }
            ).replace(".", "");


        columna.appendChild(valor);

        columna.appendChild(barra);

        columna.appendChild(etiqueta);

        graficoVentas.appendChild(columna);

    });

}


// =========================================
// PRODUCTOS MÁS VENDIDOS
// =========================================

function mostrarProductosMasVendidos() {

    const resumen = {};

    ventas.forEach(venta => {

        const productoId = venta.producto_id;

        const nombre =
            venta.productos?.nombre ||
            "Producto eliminado";

        if (!resumen[productoId]) {

            resumen[productoId] = {
                nombre,
                cantidad: 0
            };

        }

        resumen[productoId].cantidad +=
            Number(venta.cantidad);

    });

    const lista =
        Object.values(resumen)
            .sort(
                (a, b) =>
                    b.cantidad -
                    a.cantidad
            )
            .slice(0, 5);

    if (lista.length === 0) {

        productosMasVendidos.innerHTML = `
            <div class="estadistica-vacio">
                <span>📦</span>
                <p>
                    Todavía no hay ventas registradas.
                </p>
            </div>
        `;

        return;
    }

    productosMasVendidos.innerHTML = "";

    lista.forEach((producto, index) => {

        const item =
            document.createElement("div");

        item.className =
            "producto-ranking";

        const posicion =
            index === 0 ? "🥇" :
            index === 1 ? "🥈" :
            index === 2 ? "🥉" :
            `${index + 1}`;

        item.innerHTML = `

            <div class="ranking-numero">
                ${posicion}
            </div>

            <div class="ranking-info">

                <strong>
                    ${producto.nombre}
                </strong>

                <span>
                    ${producto.cantidad} unidad(es) vendidas
                </span>

            </div>

            <div class="ranking-icon">
                ${index === 0 ? "🏆" : "📦"}
            </div>

        `;

        productosMasVendidos.appendChild(item);

    });

}

// =========================================
// MÉTODOS DE PAGO
// =========================================

function mostrarMetodosPago() {

    const resumen = {};


    ventas.forEach(venta => {

        const metodo =
            venta.metodo_pago;


        if (!resumen[metodo]) {

            resumen[metodo] = {
                cantidad: 0,
                total: 0
            };

        }


        resumen[metodo].cantidad++;

        resumen[metodo].total +=
            Number(venta.total);

    });


    const lista =
        Object.entries(resumen)
            .sort(
                (a, b) =>
                    b[1].total -
                    a[1].total
            );


    if (lista.length === 0) {

        metodosPagoEstadistica.innerHTML = `
            <div class="estadistica-vacio">
                <span>💳</span>
                <p>
                    Todavía no hay ventas registradas.
                </p>
            </div>
        `;

        return;

    }


    metodosPagoEstadistica.innerHTML = "";


    const totalGeneral =
        ventas.reduce(
            (suma, venta) =>
                suma + Number(venta.total),
            0
        );


    lista.forEach(
        ([metodo, datos]) => {

            const porcentaje =
                totalGeneral > 0
                    ? (datos.total /
                        totalGeneral) *
                      100
                    : 0;


            const item =
                document.createElement("div");


            item.className =
                "metodo-pago-item";


            item.innerHTML = `

                <div class="metodo-pago-top">

                    <strong>
                        ${metodo}
                    </strong>

                    <span>
                        ${formatoPrecio(datos.total)}
                    </span>

                </div>

                <div class="metodo-barra-contenedor">

                    <div
                        class="metodo-barra"
                        style="width:${porcentaje}%"
                    ></div>

                </div>

                <small>
                    ${datos.cantidad} venta(s) ·
                    ${porcentaje.toFixed(1)}%
                </small>

            `;


            metodosPagoEstadistica.appendChild(
                item
            );

        }
    );

}


// =========================================
// STOCK BAJO
// =========================================

function mostrarStockBajo() {

    const lista =
        productos
            .filter(
                producto =>
                    Number(producto.stock) <= 5
            )
            .slice(0, 6);


    if (lista.length === 0) {

        productosStockBajo.innerHTML = `
            <div class="estadistica-vacio stock-ok">

                <span>✅</span>

                <p>
                    ¡Excelente! No tienes productos con stock bajo.
                </p>

            </div>
        `;

        return;

    }


    productosStockBajo.innerHTML = "";


    lista.forEach(producto => {

        const item =
            document.createElement("div");


        item.className =
            "stock-bajo-item";


        const nivel =
            Number(producto.stock) === 0
                ? "Agotado"
                : `${producto.stock} disponible(s)`;


        item.innerHTML = `

            <div class="stock-producto">

                <div class="stock-icon">
                    📦
                </div>

                <div>

                    <strong>
                        ${producto.nombre}
                    </strong>

                    <span>
                        ${producto.categoria || "Sin categoría"}
                    </span>

                </div>

            </div>

            <div class="stock-cantidad">

                <strong>
                    ${producto.stock}
                </strong>

                <span>
                    ${nivel}
                </span>

            </div>

        `;


        productosStockBajo.appendChild(
            item
        );

    });

}


// =========================================
// INICIAR
// =========================================

iniciarEstadisticas();