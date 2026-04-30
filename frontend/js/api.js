// constante global
const API_URL = "http://localhost:3000/api";

const casinoApi = {
    async enviarPerfil(datos) {
        try {
            const response = await fetch(`${API_URL}/jugador/perfil`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            console.error("Error en la conexión con el servidor:", error);
            return null;
        }
    }
};

const AdaptadorUI = {
    aplicarConfiguracion(config) {
        console.log("Datos recibidos por AdaptadorUI:", config);

        // 1. Intentamos extraer los datos sin importar si vienen anidados o no
        const datos = config.configuracion_juego || config;
        
        // 2. Buscamos el array (puede llamarse 'chips' o 'fichas')
        const listaChips = datos.chips || datos.fichas;

        if (!listaChips || !Array.isArray(listaChips)) {
            console.error("No se encontró un array de chips válido en la respuesta", datos);
            return;
        }

        const contenedorChips = document.querySelector('.apuesta-chips');
        if (!contenedorChips) return;

        // Limpiar fichas viejas
        contenedorChips.innerHTML = '';

        // Crear fichas basadas en el modelo
        listaChips.forEach((valor, index) => {
            const btn = document.createElement('button');
            // Activamos la segunda (index 1) o la primera si solo hay una
            btn.className = 'chip' + (index === 1 || (listaChips.length === 1 && index === 0) ? ' activa' : ''); 
            btn.dataset.val = valor;
            btn.textContent = valor;
            
            btn.onclick = () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('activa'));
                btn.classList.add('activa');
                
                // Sincronizar con la lógica de blackjack.js
                if (window.g) window.g.apuesta = parseInt(valor);
                const display = document.getElementById('apuesta-display');
                if (display) display.textContent = valor;
                
                console.log("Apuesta cambiada a:", valor);
            };

            contenedorChips.appendChild(btn);
        });

        // Actualizar el display inicial
        const valorInicial = listaChips[1] || listaChips[0];
        const apuestaDisplay = document.getElementById('apuesta-display');
        if (apuestaDisplay) apuestaDisplay.textContent = valorInicial;
        if (window.g) window.g.apuesta = parseInt(valorInicial);
        
        console.log(`Interfaz adaptada con éxito. Layout: ${datos.layout || 'estándar'}`);
    }
};

// Función para rastrear el rendimiento del jugador con el perfil actual
function registrarMetricaBJ(apuesta, esGanada) {
    let stats = JSON.parse(localStorage.getItem('bj_stats') || '{}');
    
    if (!stats.historial_reciente) stats.historial_reciente = [];
    
    stats.historial_reciente.push(esGanada ? 1 : 0);
    
    if (stats.historial_reciente.length > 10) {
        stats.historial_reciente.shift();
    }
    
    localStorage.setItem('bj_stats', JSON.stringify(stats));
    console.log("Métrica registrada:", esGanada ? "Victoria" : "Derrota");
}