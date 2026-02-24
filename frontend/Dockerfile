FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test -- --watchAll=false
EXPOSE 3000
CMD ["npm", "run", "dev"]