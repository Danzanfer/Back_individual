import pandas as pd
import joblib
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'modelo_kmeans.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')

# Cargar los archivos generados por tu model.py
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("El modelo está listo: modelo_kmeans y scaler cargados.")
except Exception as e:
    print(f"Error al cargar: {e}")
    model, scaler = None, None

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Modelo no disponible'}), 500
    
    try:
        data = request.get_json()
        
        # 1. Extraer los datos
        input_dict = {
            'bart_riesgo': data.get('bart_riesgo', 0.5),
            'mem_eficiencia': data.get('mem_eficiencia', 80),
            'bj_winrate': data.get('bj_winrate', 0.5),
            'coins': data.get('coins', 100)
        }
        
        # 2. Crear DataFrame
        features = ['bart_riesgo', 'mem_eficiencia', 'bj_winrate', 'coins']
        df_input = pd.DataFrame([input_dict])[features]
        
        # 3. Escalar y predecir
        df_scaled = scaler.transform(df_input)
        cluster = int(model.predict(df_scaled)[0])
        
        # Configuración de fichas según el perfil 
        opciones_por_perfil = {
            0: [2, 5, 10, 20],      # Perfil 0: Conservador
            1: [5, 10, 25, 50],     # Perfil 1: Estándar
            2: [10, 50, 100, 200]   # Perfil 2: Arriesgado
        }
        
        fichas = opciones_por_perfil.get(cluster, [5, 10, 25, 50])
        
        # 4. Respuesta estructurada para el AdaptadorUI
        return jsonify({
            'status': 'success',
            'perfil_ia': cluster,
            'mensaje': 'Análisis de comportamiento guardado',
            'configuracion_juego': {
                'chips': fichas,
                'layout': 'adaptativo'
            }
        }), 201 

    except Exception as e:
        return jsonify({'error': f"Error en los datos: {str(e)}"}), 400

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)