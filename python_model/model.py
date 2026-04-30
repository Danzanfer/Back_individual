import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib # Para guardar el modelo y el escalador

# 1. GENERACIÓN BASADA EN TUS NUEVOS DESCRIPTORES
np.random.seed(42)
n_samples = 500 # Subimos a 500 para mejor entrenamiento
data = []

for i in range(n_samples):
    selector = np.random.rand()
    
    # PERFILES AJUSTADOS A TUS DESCRIPTORES
    if selector < 0.3:  # ESTRATEGA (Bajo Riesgo)
        bart_riesgo = np.random.normal(30, 10) # Arriesga poco en el globo
        mem_eficiencia = np.random.normal(90, 5) # Muy eficiente
        bj_winrate = np.random.normal(0.65, 0.1) 
        coins = np.random.normal(3000, 500)
    elif selector < 0.7:  # CASUAL (Moderado)
        bart_riesgo = np.random.normal(50, 15)
        mem_eficiencia = np.random.normal(70, 10)
        bj_winrate = np.random.normal(0.45, 0.1)
        coins = np.random.normal(1200, 400)
    else:  # AGRESIVO (Alto Riesgo)
        bart_riesgo = np.random.normal(80, 15) # Arriesga mucho
        mem_eficiencia = np.random.normal(40, 15) # Poca atención/fatiga
        bj_winrate = np.random.normal(0.25, 0.1)
        coins = np.random.normal(300, 200)

    data.append({
        'username': f'user_{1000+i}',
        'bart_riesgo': max(0, round(bart_riesgo, 2)),
        'mem_eficiencia': max(0, min(100, int(mem_eficiencia))),
        'bj_winrate': max(0, min(1, round(bj_winrate, 2))),
        'coins': max(0, int(coins)),
        'clima': np.random.choice([15, 20, 25, 30]) # Temperatura simple
    })

df = pd.DataFrame(data)

# 2. ENTRENAMIENTO
features = ['bart_riesgo', 'mem_eficiencia', 'bj_winrate', 'coins']
X = df[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, n_init=10, random_state=42)
df['cluster'] = kmeans.fit_predict(X_scaled)

# Guardar modelo y escalador para usar en Flask después
joblib.dump(kmeans, 'modelo_kmeans.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("Modelo entrenado y guardado.")