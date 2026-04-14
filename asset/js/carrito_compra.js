// 1. Configuramos la URL de tu API en Render
const API_URL = 'https://agromarket-zebh.onrender.com/api/finalizar-compra/';

let carrito = JSON.parse(localStorage.getItem('agromarket_cart')) || [];

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

function guardarYActualizar() {
    localStorage.setItem('agromarket_cart', JSON.stringify(carrito));
    
    if (typeof renderizarCarrito === "function") {
        renderizarCarrito();
    }
    
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    console.log("Total actualizado: $", total);
}

async function confirmarCompra() {
    if (carrito.length === 0) {
        return alert("Tu carrito está vacío. Agrega algunos productos orgánicos.");
    }

    const totalCompra = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    
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

async function confirmarCompra() {
    if (carrito.length === 0) {
        return alert("El carrito está vacío 🍎");
    }

    const totalCompra = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    
    const datosPedido = {
        carrito: carrito,
        total: totalCompra
    };

    try {
        const response = await fetch('https://agromarket-zebh.onrender.com/api/finalizar-compra/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        if (response.ok) {
            alert("✅ ¡Compra exitosa! Pedido registrado en Render.");
            carrito = [];
            localStorage.removeItem('agromarket_cart');
            location.reload(); // Recarga para limpiar la vista
        } else {
            alert("Error al procesar la compra.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    }
}