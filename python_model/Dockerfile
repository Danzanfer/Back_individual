FROM python:3.9-slim

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalamos dependencias del sistema necesarias para conectar con Postgres
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo de requisitos e instalamos las librerías
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el contenido de tu carpeta python_model al contenedor
COPY . .

# Comando para ejecutar tu servidor Flask
CMD ["python", "app.py"]