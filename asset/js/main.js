const API_URL = 'https://agromarket-zebh.onrender.com/api/productos/';
const API_COMPRA = 'https://agromarket-zebh.onrender.com/api/finalizar-compra/';
const URL_BASE = 'https://agromarket-zebh.onrender.com';

async function cargarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();

        contenedor.innerHTML = '';

        if (productos.length === 0) {
            contenedor.innerHTML = '<p class="col-span-3 text-center text-gray-500 text-xl">Aún no hay productos disponibles.</p>';
            return;
        }

        productos.forEach(producto => {
            const hayStock = producto.stock > 0;
            const precioCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(producto.precio);

            const imagenUrl = producto.imagen_url
                ? producto.imagen_url 
                : (producto.imagen
                    ? (producto.imagen.startsWith('http') ? producto.imagen : BASE_URL + producto.imagen)
                    : 'https://via.placeholder.com/400x300?text=Sin+Foto');

            const tarjetaHTML = `
                <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all p-4">
                    <img src="${imagenUrl}" class="w-full h-48 object-cover rounded-md mb-4 ${!hayStock ? 'grayscale' : ''}">
                    <h2 class="text-xl font-bold text-green-900">${producto.nombre}</h2>
                    <p class="text-sm text-gray-600 mb-2">${producto.descripcion || ''}</p>
                    <div class="bg-green-50 p-2 rounded text-xs mb-4">
                        <p><strong>CO2:</strong> ${producto.huella_carbono_estimada} kg | <strong>Stock:</strong> ${producto.stock}</p>
                    </div>
                    <div class="flex justify-between items-center mt-auto">
                        <span class="text-xl font-bold text-green-700">${precioCLP}</span>
                        ${hayStock
                    ? `<button onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio})" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">Añadir</button>`
                    : `<button disabled class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">Agotado</button>`
                }
                    </div>
                </div>
            `;
            contenedor.innerHTML += tarjetaHTML;
        });
    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `<p class="text-red-500 text-center col-span-3">Error al conectar con Render.</p>`;
    }
}

let carrito = JSON.parse(localStorage.getItem('agroCarrito')) || [];

function agregarAlCarrito(id, nombre, precio) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    localStorage.setItem('agroCarrito', JSON.stringify(carrito));
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalDinero = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    const btnCarrito = document.getElementById('btn-ver-carrito');
    if (btnCarrito) btnCarrito.innerText = `🛒 Carrito (${totalItems})`;

    const txtTotal = document.getElementById('total-carrito');
    if (txtTotal) txtTotal.innerText = `$${totalDinero}`;
}

async function confirmarCompra() {
    if (carrito.length === 0) return alert("El carrito está vacío.");

    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    try {
        const res = await fetch(API_COMPRA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrito, total })
        });

        if (res.ok) {
            alert("✅ ¡Compra exitosa! Revisa el Admin de Render.");
            carrito = [];
            actualizarCarrito();
            location.reload();
        }
    } catch (error) {
        alert("Error al conectar con el servidor.");
    }
}


document.addEventListener('DOMContentLoaded', cargarProductos);
actualizarCarrito();