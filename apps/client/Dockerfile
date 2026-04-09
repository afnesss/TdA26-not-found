FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build

FROM nginx:1.25-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3001
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /tmp/default.conf && cp /tmp/default.conf /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]