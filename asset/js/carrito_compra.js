// 1. Configuramos la URL de tu API en Render
const API_URL = 'https://agromarket-zebh.onrender.com/api/finalizar-compra/';

// 2. Cargamos el carrito desde el almacenamiento del navegador
let carrito = JSON.parse(localStorage.getItem('agromarket_cart')) || [];

// 3. Función para agregar productos
function agregarAlCarrito(id, nombre, precio) {
    // Buscamos si el producto ya está en el carrito
    const existe = carrito.find(p => p.id === id);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id, nombre, precio: parseFloat(precio), cantidad: 1 });
    }
    
    guardarYActualizar();
    alert(`${nombre} agregado al carrito 🍎`);
}

// 4. Guarda en LocalStorage y refresca la vista
function guardarYActualizar() {
    localStorage.setItem('agromarket_cart', JSON.stringify(carrito));
    
    // Si tienes una función que dibuja el carrito en el HTML, llámala aquí
    if (typeof renderizarCarrito === "function") {
        renderizarCarrito();
    }
    
    // Calculamos el total para mostrarlo en consola
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    console.log("Total actualizado: $", total);
}

// 5. Función principal: ENVIAR COMPRA A RENDER
async function confirmarCompra() {
    if (carrito.length === 0) {
        return alert("Tu carrito está vacío. Agrega algunos productos orgánicos.");
    }

    const totalCompra = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    
    // Preparamos los datos para Django
    const datosPedido = {
        carrito: carrito,
        total: totalCompra
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosPedido)
        });

        if (response.ok) {
            const resultado = await response.json();
            alert(`✅ ¡Éxito! Pedido #${resultado.pedido_id} registrado en el sistema.`);
            
            // Limpiamos el carrito tras la compra
            carrito = [];
            guardarYActualizar();
        } else {
            alert("❌ Hubo un error al procesar la compra. Revisa la consola.");
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("No se pudo conectar con el servidor de Render.");
    }
}