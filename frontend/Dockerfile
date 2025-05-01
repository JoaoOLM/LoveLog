# Usar imagem oficial do Node
FROM node:20

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar package.json e package-lock.json primeiro (pra aproveitar o cache)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Expor a porta do Next.js
EXPOSE 3000

# Rodar o dev server
CMD ["npm", "run", "dev"]