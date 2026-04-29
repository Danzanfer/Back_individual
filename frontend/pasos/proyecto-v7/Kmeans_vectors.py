import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

# 1. GENERACIÓN REALISTA (300 Jugadores)
np.random.seed(42)
n_samples = 300
data = []

for i in range(n_samples):
    selector = np.random.rand()
    
    # Creamos solapamiento usando desviaciones estándar amplias (std)
    if selector < 0.3:  # Perfil Estratega (Ganadores)
        ganadas = np.random.normal(70, 15)
        perdidas = np.random.normal(25, 10)
        coins = np.random.normal(4000, 900)
    elif selector < 0.7:  # Perfil Moderado (Casuals)
        ganadas = np.random.normal(40, 15)
        perdidas = np.random.normal(45, 15)
        coins = np.random.normal(1200, 600)
    else:  # Perfil Agresivo (Perdedores)
        ganadas = np.random.normal(15, 10)
        perdidas = np.random.normal(75, 20)
        coins = np.random.normal(200, 150)

    # Limpieza de valores básicos
    ganadas = max(0, int(ganadas))
    perdidas = max(0, int(perdidas))
    coins = max(0, int(coins))
    neto = (ganadas - perdidas) * 10
    
    data.append({
        'jugador_id': f'USR-{1000+i}',
        'bj_ganadas': ganadas,
        'bj_perdidas': perdidas,
        'coins_actuales': coins,
        'bart_neto': neto
    })

df = pd.DataFrame(data)

# 2. PROCESAMIENTO Y CLUSTERING
features = ['bj_ganadas', 'bj_perdidas', 'coins_actuales', 'bart_neto']
X = df[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Buscamos los 3 perfiles básicos
kmeans = KMeans(n_clusters=3, n_init=10, random_state=42)
df['cluster'] = kmeans.fit_predict(X_scaled)

# 3. ETIQUETADO AUTOMÁTICO BASADO EN DATOS
# Ordenamos los clusters por el promedio de 'coins_actuales'
# El que tiene más monedas será 'BAJO_RIESGO', el que menos 'ALTO_RIESGO'
orden_clusters = df.groupby('cluster')['coins_actuales'].mean().sort_values(ascending=False).index

mapeo_etiquetas = {
    orden_clusters[0]: "BAJO_RIESGO (Estratega)",
    orden_clusters[1]: "MODERADO (Casual)",
    orden_clusters[2]: "ALTO_RIESGO (Agresivo)"
}
df['perfil_ia'] = df['cluster'].map(mapeo_etiquetas)

# 4. VISUALIZACIÓN PROFESIONAL
plt.figure(figsize=(12, 7))
sns.set_style("darkgrid")

# Graficamos Ganadas vs Coins con las nuevas etiquetas
scatter = sns.scatterplot(
    data=df, 
    x='bj_ganadas', 
    y='coins_actuales', 
    hue='perfil_ia', 
    palette={'BAJO_RIESGO (Estratega)': '#50fa7b', 
              'MODERADO (Casual)': '#f1fa8c', 
              'ALTO_RIESGO (Agresivo)': '#ff5555'},
    s=100, 
    alpha=0.7,
    edgecolor='black'
)

plt.title('Análisis de Vectores de Jugadores: Clustering K-Means', fontsize=15)
plt.xlabel('Partidas Ganadas (Habilidad/Suerte)', fontsize=12)
plt.ylabel('Balance Actual (Coins)', fontsize=12)
plt.legend(title='Perfil Identificado por IA', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()

# Resumen para tu reporte
print("\n=== RESUMEN DE CLUSTERS POR IA ===")
print(df.groupby('perfil_ia')[features].mean().round(2))