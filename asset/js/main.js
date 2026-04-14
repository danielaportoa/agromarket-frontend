    const API_URL = 'https://agromarket-zebh.onrender.com/api/productos/';

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
                
                // Dentro de tu productos.forEach...
                const botonHTML = hayStock 
                    ? `<button onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio})" 
                        class="bg-tierra text-white px-4 py-2 rounded hover:bg-agro transition-colors duration-300 font-semibold shadow-sm">
                        Añadir
                        </button>`
                    : `<button disabled class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed font-semibold shadow-sm">
                        Agotado
                        </button>`;

                const badgeStock = hayStock 
                    ? `<span class="text-xs text-green-600 font-medium">Stock: ${producto.stock} un.</span>`
                    : `<span class="text-xs text-red-600 font-bold uppercase">Sin existencias</span>`;

                const precioCLP = new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    maximumFractionDigits: 0
                }).format(producto.precio);

                const imagenUrl = producto.imagen 
                    ? (producto.imagen.startsWith('http') ? producto.imagen : URL_BASE + producto.imagen)
                    : 'https://via.placeholder.com/400x300?text=Sin+Foto';

                const sellosHTML = producto.certificaciones.map(c => {
                    const iconoUrl = c.icono.startsWith('http') ? c.icono : URL_BASE + c.icono;
                    return `<img src="${iconoUrl}" title="${c.nombre}" class="w-8 h-8 object-contain">`;
                }).join('');

                const tarjetaHTML = `
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${!hayStock ? 'opacity-75' : ''}">
                        <div class="relative">
                            <img src="${imagenUrl}" alt="${producto.nombre}" class="w-full h-48 object-cover ${!hayStock ? 'grayscale' : ''}">
                            ${producto.es_certified_organico ? 
                                `<span class="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-md">🌱 Orgánico</span>` 
                                : ''}
                        </div>
                        
                        <div class="p-5 flex flex-col flex-grow">
                            <div class="flex justify-between items-start mb-2">
                                <h2 class="text-xl font-bold text-tierra">${producto.nombre}</h2>
                                <div class="flex space-x-1">${sellosHTML}</div>
                            </div>
                            
                            <div class="text-xs space-y-1 mb-4 bg-green-50 p-2 rounded text-green-800">
                                <div class="flex justify-between">
                                    <span><strong>Huella CO2:</strong> ${producto.huella_carbono_estimada} kg</span>
                                    ${badgeStock}
                                </div>
                                <p><strong>Distancia:</strong> ${producto.distancia_km} km</p>
                                ${producto.kilometro_cero ? '<p class="font-bold text-agro">📍 Productor Local (Km 0)</p>' : ''}
                            </div>

                            <p class="text-gray-600 text-sm mb-4 flex-grow">${producto.descripcion}</p>
                            
                            <div class="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span class="text-2xl font-extrabold text-agro">${precioCLP}</span>
                                ${botonHTML}
                            </div>
                        </div>
                    </div>
                `;
                contenedor.innerHTML += tarjetaHTML;
            });

        } catch (error) {
            console.error("Error al obtener los productos:", error);
            contenedor.innerHTML = `
                <div class="col-span-3 text-center p-8 bg-red-50 text-red-600 rounded-lg border border-red-200">
                    <p class="text-xl font-bold">¡Oops! No pudimos conectar con el servidor.</p>
                    <p class="mt-2 text-sm">Asegúrate de que Django esté corriendo.</p>
                </div>
            `;
        }
    }

let carrito = JSON.parse(localStorage.getItem('agroCarrito')) || [];

function agregarAlCarrito(id, nombre, precio) {
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    localStorage.setItem('agroCarrito', JSON.stringify(carrito));
    
    actualizarContador();
    
    alert(`¡${nombre} añadido al carrito! 🌱`);
}

function actualizarContador() {
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const carritoEnlace = document.querySelector('a[href="#"]:last-child');
    if (carritoEnlace) {
        carritoEnlace.innerText = `Carrito (${totalItems})`;
    }
}

actualizarContador();

document.querySelector('a[href="#"]:last-child').addEventListener('click', (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. ¡Los productos de Maule te esperan! 🌱");
    } else {
        const resumen = carrito.map(item => `${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}`).join('\n');
        alert("Tu Pedido Actual:\n" + resumen);
    }
});
    document.addEventListener('DOMContentLoaded', cargarProductos);
