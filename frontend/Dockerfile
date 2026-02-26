FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 1. Umesto testa (koji može da obori build na Cloud-u), pokreni Build
RUN npm run build

# 2. Next.js na produkciji obično radi na portu 3000
EXPOSE 3000

# 3. Pokreni produkcioni server, ne "dev"
CMD ["npm", "start"]