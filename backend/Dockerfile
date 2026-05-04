FROM node:18-alpine

# Instalamos dependencias necesarias para compilar bcrypt en Linux
RUN apk add --no-cache python3 g++ make

WORKDIR /app

# Copiamos solo los archivos de dependencias
COPY package*.json ./

# Instalamos DESDE CERO dentro del contenedor
RUN npm install

# Copiamos el resto del código
COPY . .

EXPOSE 3000

# Usamos 'npm run dev' porque tienes nodemon en devDependencies
CMD ["npm", "run", "dev"]