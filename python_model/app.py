import pandas as pd
import joblib
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'modelo_kmeans.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')

# Cargar los archivos generados por tu model.py
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ El modelo está listo: modelo_kmeans y scaler cargados.")
except Exception as e:
    print(f"❌ Error al cargar: {e}")
    model, scaler = None, None

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None and scaler is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint para predicción de perfil de jugador basado en comportamiento.
    
    Expected input:
    {
        'bart_riesgo': float,
        'mem_eficiencia': int (0-100),
        'bj_winrate': float (0-1),
        'coins': int
    }
    
    Returns:
    {
        'status': 'success',
        'perfil_ia': int (0, 1, or 2),
        'perfil_nombre': str,
        'configuracion_juego': {...},
        'confianza': float
    }
    """
    
    if not model or not scaler:
        logger.error("Modelo no cargado")
        return jsonify({'error': 'Modelo no disponible', 'status': 'error'}), 500
    
    try:
        data = request.get_json()
        
        # FIX: Validar input
        if not data:
            return jsonify({'error': 'No data provided', 'status': 'error'}), 400
        
        # 1. Extraer y validar los datos
        try:
            bart_riesgo = float(data.get('bart_riesgo', 0.5))
            mem_eficiencia = float(data.get('mem_eficiencia', 80))
            bj_winrate = float(data.get('bj_winrate', 0.5))
            coins = float(data.get('coins', 100))
        except (TypeError, ValueError) as e:
            logger.error(f"Tipo de dato inválido: {e}")
            return jsonify({
                'error': f'Tipos de datos inválidos: {str(e)}',
                'status': 'error'
            }), 400
        
        input_dict = {
            'bart_riesgo': bart_riesgo,
            'mem_eficiencia': mem_eficiencia,
            'bj_winrate': bj_winrate,
            'coins': coins
        }
        
        logger.info(f"Input recibido: {input_dict}")
        
        # 2. Crear DataFrame
        features = ['bart_riesgo', 'mem_eficiencia', 'bj_winrate', 'coins']
        df_input = pd.DataFrame([input_dict])[features]
        
        # 3. Escalar y predecir
        df_scaled = scaler.transform(df_input)
        cluster = int(model.predict(df_scaled)[0])
        
        # Calcular confianza basada en distancia a centroide
        distancia = min(model.transform(df_scaled)[0])
        confianza = max(0, 1 - (distancia / 10))  # Normalizar a 0-1
        
        # 4. Configuración de fichas según el perfil 
        opciones_por_perfil = {
            0: [2, 5, 10, 20],      # Perfil 0: Conservador
            1: [5, 10, 25, 50],     # Perfil 1: Estándar
            2: [10, 50, 100, 200]   # Perfil 2: Arriesgado
        }
        
        nombres_perfil = {
            0: 'Conservador / Bajo Riesgo',
            1: 'Moderado / Estratégico',
            2: 'Arriesgado / Impulsivo'
        }
        
        fichas = opciones_por_perfil.get(cluster, [5, 10, 25, 50])
        nombre = nombres_perfil.get(cluster, f'Cluster {cluster}')
        
        # 5. Respuesta estructurada (FIX: usar 'perfil_ia' no 'perfil_jugador')
        respuesta = {
            'status': 'success',
            'perfil_ia': cluster,  # ← IMPORTANTE: Node.js espera esto
            'perfil_nombre': nombre,
            'configuracion_juego': {
                'chips': fichas,
                'layout': 'adaptativo'
            },
            'confianza': round(confianza, 3),
            'probabilidad_fuga': round(1 - confianza, 3)
        }
        
        logger.info(f"Predicción exitosa: {respuesta}")
        return jsonify(respuesta), 201

    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        return jsonify({
            'error': f"Error en predicción: {str(e)}",
            'status': 'error'
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
