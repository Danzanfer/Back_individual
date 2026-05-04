// Constante global - Usamos 127.0.0.1 para evitar problemas de resolución en entornos locales
const API_URL = "http://127.0.0.1:3000/api";

// Variable de control para evitar bucles infinitos y saturación del servidor
let estaSincronizandoIA = false;

const casinoApi = {
    async enviarPerfil(datos) {
        try {
            console.log("📡 Enviando datos al servidor:", `${API_URL}/predicciones`);
            
            const response = await fetch(`${API_URL}/predicciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            // Si el servidor responde con error (como el 500 que veías)
            if (!response.ok) {
                const errorTexto = await response.text();
                console.error(`❌ Error del servidor (${response.status}):`, errorTexto);
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("❌ Error de red o conexión:", error);
            return null;
        }
    } 
}; 

const AdaptadorUI = {
    aplicarConfiguracion(config) {
        if (!config) return;
        
        // Extraemos los datos buscando en las posibles estructuras de respuesta
        const datosIA = config.configuracion_juego || 
                        (config.data && config.data.configuracion_juego) || 
                        config;
        
        const listaChips = datosIA.chips || datosIA.fichas;

        if (!listaChips || !Array.isArray(listaChips)) {
            console.error("⚠️ No se recibió un formato de fichas válido:", datosIA);
            return;
        }

        const contenedorChips = document.querySelector('.apuesta-chips');
        if (!contenedorChips) return;

        // Limpiar y renderizar nuevas fichas adaptadas por la IA[cite: 5]
        contenedorChips.innerHTML = '';
        listaChips.forEach((valor, index) => {
            const btn = document.createElement('button');
            btn.className = 'chip' + (index === 1 ? ' activa' : ''); 
            btn.dataset.val = valor;
            btn.textContent = valor;
            
            btn.onclick = () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('activa'));
                btn.classList.add('activa');
                if (window.g) window.g.apuesta = parseInt(valor);
                const display = document.getElementById('apuesta-display');
                if (display) display.textContent = valor;
            };

            contenedorChips.appendChild(btn);
        });
        
        console.log(`✅ Interfaz adaptada al perfil: ${config.perfil_nombre || 'Detectado'}`);
    }
};

// FUNCIÓN DE SINCRONIZACIÓN CORREGIDA
async function sincronizarPerfilIA() {
    // 1. Evitar que la función se ejecute si ya hay una petición en curso[cite: 5]
    if (estaSincronizandoIA) return;
    
    try {
        if (typeof Vector === 'undefined') {
            console.warn("IA: Esperando a que el motor de datos esté listo...");
            return;
        }

        const vectorDatos = Vector.construir();
        
        // 2. CAMBIO CRÍTICO: Payload plano para que Node y Flask no den Error 500[cite: 3, 5]
        const payload = {
            usuario_id: vectorDatos.jugador_id,
            bart_riesgo: vectorDatos.bart_score || 0.5,
            mem_eficiencia: vectorDatos.mem_eficiencia || 50,
            bj_winrate: vectorDatos.bj_partidas > 0 ? (vectorDatos.bj_ganadas / vectorDatos.bj_partidas) : 0.5,
            coins: vectorDatos.coins_actuales || 0
        };

        estaSincronizandoIA = true;
        console.log("🤖 Iniciando proceso de análisis de perfil...");

        const respuesta = await casinoApi.enviarPerfil(payload);

        if (respuesta) {
            console.log("✅ Respuesta de IA recibida correctamente.");
            AdaptadorUI.aplicarConfiguracion(respuesta);
        }

    } catch (error) {
        console.error("❌ Fallo en la sincronización:", error);
    } finally {
        // 3. Cooldown: Esperar 5 segundos antes de permitir otra sincronización
        // Esto detiene el bucle infinito que tenías en la consola[cite: 5]
        setTimeout(() => {
            estaSincronizandoIA = false;
        }, 5000);
    }
}

// Exportar funciones al objeto window
window.casinoApi = casinoApi;
window.AdaptadorUI = AdaptadorUI;
window.sincronizarPerfilIA = sincronizarPerfilIA;