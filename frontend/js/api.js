const API_URL = "http://127.0.0.1:3000/api";

let estaSincronizandoIA = false;

function getAuthToken() {
  try {
    const jugador = JSON.parse(localStorage.getItem('jugador_actual') || '{}');
    return jugador.token || null;
  } catch (e) {
    return null;
  }
}

const casinoApi = {
    async enviarPerfil(datos) {
        try {
            const token = getAuthToken();
            console.log("📡 Enviando datos al servidor:", `${API_URL}/predicciones`);
            console.log("📦 Payload:", datos);  // Debug
            
            const response = await fetch(`${API_URL}/predicciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(datos)
            });

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

const normalizarNumero = (valor, fallback) => {
    if (valor === null || valor === undefined) return fallback;
    const numero = parseFloat(String(valor).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(numero) ? numero : fallback;
};


const vectorCompleto = (vector) => {
    if (!vector) return false;
    
    const tieneBJ = typeof vector.bj_partidas === 'number'; 
    const tieneBART = vector.bart_score !== null && 
                      vector.bart_score !== undefined && 
                      vector.bart_score !== '';
    const tieneMemoria = vector.mem_eficiencia !== null && 
                         vector.mem_eficiencia !== undefined && 
                         vector.mem_eficiencia !== '';
    const tieneCoins = typeof vector.coins_actuales === 'number';

    return tieneBJ && tieneBART && tieneMemoria && tieneCoins;
};

async function sincronizarPerfilIA() {
    if (estaSincronizandoIA) return;

    if (typeof Vector === 'undefined') {
        console.warn("IA: Esperando a que el motor de datos esté listo...");
        return;
    }

    const vectorDatos = Vector.construir();
    if (!vectorCompleto(vectorDatos)) {
        console.log("🔎 Vector incompleto: esperando Blackjack, BART y Memoria...");
        console.log("Estado actual:", {
            bj: vectorDatos.bj_partidas,
            bart: vectorDatos.bart_score,
            mem: vectorDatos.mem_eficiencia,
            coins: vectorDatos.coins_actuales
        });
        return;
    }

    
    const payload = {
        jugador_actual: {
            id: vectorDatos.jugador_id,
            username: vectorDatos.username  // ← NUEVA LÍNEA: Requerido por el servidor
        },
        
        datos_conductuales: {
            bart_riesgo: normalizarNumero(vectorDatos.bart_score, 0.5),
            mem_eficiencia: normalizarNumero(vectorDatos.mem_eficiencia, 50),
            coins: normalizarNumero(vectorDatos.coins_actuales, 0)
        },
        
        bj_stats: {
            bj_partidas: vectorDatos.bj_partidas,
            bj_ganadas: vectorDatos.bj_ganadas || 0,
            bj_total_perdido: vectorDatos.bj_total_perdido || 0,
            bj_total_apostado: vectorDatos.bj_total_apuesta || 0,
            bj_winrate: vectorDatos.bj_partidas > 0 
                ? (vectorDatos.bj_ganadas / vectorDatos.bj_partidas) 
                : 0.5
        },
        
        coins: normalizarNumero(vectorDatos.coins_actuales, 0)
    };

    estaSincronizandoIA = true;
    console.log("🤖 Iniciando proceso de análisis de perfil con vector completo...");

    try {
        const respuesta = await casinoApi.enviarPerfil(payload);
        if (respuesta) {
            console.log("✅ Respuesta de IA recibida correctamente.");
            console.log("Perfil detectado:", respuesta.perfil);
            AdaptadorUI.aplicarConfiguracion(respuesta);
        }
    } catch (error) {
        console.error("❌ Fallo en la sincronización:", error);
    } finally {
        setTimeout(() => {
            estaSincronizandoIA = false;
        }, 5000);
    }
}

window.casinoApi = casinoApi;
window.AdaptadorUI = AdaptadorUI;
window.sincronizarPerfilIA = sincronizarPerfilIA;
