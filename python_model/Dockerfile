FROM python:3.9-slim
WORKDIR /app
# Instalamos dependencias de sistema para que scikit-learn y pandas no fallen
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copiamos todo (incluyendo la carpeta models/)
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]