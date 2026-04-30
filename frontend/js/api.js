// constante global
const API_URL = "http://localhost:3000/api";

const casinoApi = {
    async enviarPerfil(datos) {
        try {
            console.log("Enviando datos a:", `${API_URL}/predicciones`);
            
            const response = await fetch(`${API_URL}/predicciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            // 1. Obtenemos el texto plano primero para ver qué llega
            const textoRespuesta = await response.text();
            console.log("Respuesta bruta del servidor:", textoRespuesta);

            // 2. Intentamos convertirlo a JSON solo si hay algo que convertir
            if (!textoRespuesta || textoRespuesta.startsWith('<!DOCTYPE')) {
                console.error("El servidor respondió con HTML o vacío. Posible error 404/500.");
                return null;
            }

            return JSON.parse(textoRespuesta);
        } catch (error) {
            console.error("Error detallado:", error);
            return null;
        }
    } // <--- FALTABA ESTA LLAVE DE LA FUNCIÓN
}; // <--- FALTABA ESTA LLAVE DEL OBJETO

const AdaptadorUI = {
    aplicarConfiguracion(config) {
        if (!config) return;
        console.log("Datos recibidos por AdaptadorUI:", config);

        const datos = config.configuracion_juego || 
                      (config.data && config.data.configuracion_juego) || 
                      config;
        
        const listaChips = datos.chips || datos.fichas;

        if (!listaChips || !Array.isArray(listaChips)) {
            console.error("Error: Se esperaba un array en 'chips', pero se recibió:", datos);
            return;
        }

        const contenedorChips = document.querySelector('.apuesta-chips');
        if (!contenedorChips) return;

        contenedorChips.innerHTML = '';

        listaChips.forEach((valor, index) => {
            const btn = document.createElement('button');
            btn.className = 'chip' + (index === 1 || (listaChips.length === 1 && index === 0) ? ' activa' : ''); 
            btn.dataset.val = valor;
            btn.textContent = valor;
            
            btn.onclick = () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('activa'));
                btn.classList.add('activa');
                
                if (window.g) window.g.apuesta = parseInt(valor);
                const display = document.getElementById('apuesta-display');
                if (display) display.textContent = valor;
                
                console.log("Apuesta cambiada a:", valor);
            };

            contenedorChips.appendChild(btn);
        });

        const valorInicial = listaChips[1] || listaChips[0];
        const apuestaDisplay = document.getElementById('apuesta-display');
        if (apuestaDisplay) apuestaDisplay.textContent = valorInicial;
        if (window.g) window.g.apuesta = parseInt(valorInicial);
        
        console.log(`Interfaz adaptada con éxito. Layout: ${datos.layout || 'estándar'}`);
    }
};

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