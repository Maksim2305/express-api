FROM node:19.5.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g prisma

RUN prisma generate

COPY src/prisma/schema.prisma ./prisma/

EXPOSE 3001

CMD ["npm", "start"]