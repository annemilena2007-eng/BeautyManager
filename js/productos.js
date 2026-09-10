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
// ELEMENTOS DE LA PÁGINA
// ======================================

const productoForm = document.getElementById("productoForm");
const productoMensaje = document.getElementById("productoMensaje");
const listaProductos = document.getElementById("listaProductos");
const cerrarSesion = document.getElementById("cerrarSesion");

const buscarProducto = document.getElementById("buscarProducto");

const modalEditar = document.getElementById("modalEditar");
const cerrarModal = document.getElementById("cerrarModal");
const cancelarEdicion = document.getElementById("cancelarEdicion");
const editarForm = document.getElementById("editarForm");


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
// VARIABLE PARA GUARDAR PRODUCTOS
// ======================================

let productosGuardados = [];


// ======================================
// AGREGAR PRODUCTO
// ======================================

if (productoForm) {

    productoForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nombre = document
            .getElementById("nombreProducto")
            .value
            .trim();

        const categoria = document
            .getElementById("categoriaProducto")
            .value;

        const precio = Number(
            document.getElementById("precioProducto").value
        );

        const stock = Number(
            document.getElementById("stockProducto").value
        );


        productoMensaje.textContent = "Guardando producto...";


        const {
            data: { user }
        } = await supabase.auth.getUser();


        if (!user) {

            productoMensaje.textContent =
                "Tu sesión ha expirado. Inicia sesión nuevamente.";

            return;
        }


        const { error } = await supabase
            .from("productos")
            .insert({

                user_id: user.id,
                nombre: nombre,
                categoria: categoria,
                precio: precio,
                stock: stock

            });


        if (error) {

            console.error(error);

            productoMensaje.textContent =
                "No se pudo guardar el producto.";

            return;
        }


        productoMensaje.textContent =
            "¡Producto guardado correctamente! 💗";


        productoForm.reset();


        cargarProductos();

    });

}


// ======================================
// CARGAR PRODUCTOS
// ======================================

async function cargarProductos() {

    listaProductos.textContent =
        "Cargando productos...";


    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {

        window.location.href = "index.html";

        return;
    }


    const { data: productos, error } =
        await supabase
            .from("productos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        listaProductos.textContent =
            "No se pudieron cargar los productos.";

        return;
    }


    productosGuardados = productos || [];

    mostrarProductos(productosGuardados);

}


// ======================================
// MOSTRAR PRODUCTOS
// ======================================

function mostrarProductos(productos) {

    if (!productos || productos.length === 0) {

        listaProductos.innerHTML =
            "<p>Aún no tienes productos registrados.</p>";

        return;
    }


    listaProductos.innerHTML = "";


    productos.forEach((producto) => {

        const productoDiv =
            document.createElement("div");


        productoDiv.className = "producto-item";


        // STOCK BAJO
        let estadoStock = "";

        if (producto.stock === 0) {

            estadoStock =
                `<span class="stock-agotado">
                    Agotado
                </span>`;

        } else if (producto.stock <= 5) {

            estadoStock =
                `<span class="stock-bajo">
                    Stock bajo
                </span>`;

        } else {

            estadoStock =
                `<span class="stock-normal">
                    Disponible
                </span>`;

        }


        productoDiv.innerHTML = `

            <div class="producto-info">

                <h3>
                    ${producto.nombre}
                </h3>

                <p>
                    Categoría:
                    <strong>${producto.categoria}</strong>
                </p>

                <p>
                    Precio:
                    <strong>
                        $${Number(producto.precio)
                            .toLocaleString("es-CO")}
                    </strong>
                </p>

                <p>
                    Stock:
                    <strong>${producto.stock}</strong>
                    ${estadoStock}
                </p>

            </div>


            <div class="producto-acciones">

                <button
                    class="btn-editar"
                    data-id="${producto.id}"
                >
                    ✏️ Editar
                </button>


                <button
                    class="btn-eliminar"
                    data-id="${producto.id}"
                >
                    🗑️ Eliminar
                </button>

            </div>

            <hr>

        `;


        listaProductos.appendChild(productoDiv);

    });


    // BOTONES EDITAR

    document
        .querySelectorAll(".btn-editar")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                const id = boton.dataset.id;

                abrirEditar(id);

            });

        });


    // BOTONES ELIMINAR

    document
        .querySelectorAll(".btn-eliminar")
        .forEach((boton) => {

            boton.addEventListener("click", () => {

                const id = boton.dataset.id;

                eliminarProducto(id);

            });

        });

}


// ======================================
// BUSCAR PRODUCTOS
// ======================================

if (buscarProducto) {

    buscarProducto.addEventListener("input", () => {

        const texto =
            buscarProducto.value
                .toLowerCase()
                .trim();


        const productosFiltrados =
            productosGuardados.filter((producto) => {

                return (
                    producto.nombre
                        .toLowerCase()
                        .includes(texto)
                    ||
                    producto.categoria
                        .toLowerCase()
                        .includes(texto)
                );

            });


        mostrarProductos(productosFiltrados);

    });

}


// ======================================
// ABRIR MODAL DE EDICIÓN
// ======================================

function abrirEditar(id) {

    const producto =
        productosGuardados.find(
            (item) => String(item.id) === String(id)
        );


    if (!producto) {
        return;
    }


    document.getElementById("editarId").value =
        producto.id;


    document.getElementById("editarNombre").value =
        producto.nombre;


    document.getElementById("editarCategoria").value =
        producto.categoria;


    document.getElementById("editarPrecio").value =
        producto.precio;


    document.getElementById("editarStock").value =
        producto.stock;


    modalEditar.style.display = "flex";

}


// ======================================
// CERRAR MODAL
// ======================================

function cerrarModalEditar() {

    modalEditar.style.display = "none";

}


if (cerrarModal) {

    cerrarModal.addEventListener(
        "click",
        cerrarModalEditar
    );

}


if (cancelarEdicion) {

    cancelarEdicion.addEventListener(
        "click",
        cerrarModalEditar
    );

}


// ======================================
// GUARDAR CAMBIOS
// ======================================

if (editarForm) {

    editarForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const id =
                document.getElementById("editarId").value;


            const nombre =
                document.getElementById("editarNombre")
                    .value
                    .trim();


            const categoria =
                document.getElementById("editarCategoria")
                    .value;


            const precio =
                Number(
                    document.getElementById("editarPrecio")
                        .value
                );


            const stock =
                Number(
                    document.getElementById("editarStock")
                        .value
                );


            const {
                data: { user }
            } = await supabase.auth.getUser();


            if (!user) {

                window.location.href = "index.html";

                return;
            }


            const { error } =
                await supabase
                    .from("productos")
                    .update({

                        nombre: nombre,
                        categoria: categoria,
                        precio: precio,
                        stock: stock

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
                "¡Producto actualizado correctamente! 💗"
            );


            cerrarModalEditar();


            cargarProductos();

        }
    );

}


// ======================================
// ELIMINAR PRODUCTO
// ======================================

async function eliminarProducto(id) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar este producto?"
        );


    if (!confirmar) {
        return;
    }


    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {

        window.location.href = "index.html";

        return;
    }


    const { error } =
        await supabase
            .from("productos")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar el producto."
        );

        return;
    }


    alert(
        "Producto eliminado correctamente. 🗑️"
    );


    cargarProductos();

}


// ======================================
// CARGAR AL ABRIR
// ======================================

cargarProductos();