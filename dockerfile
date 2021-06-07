FROM node:lts-buster-slim

RUN apt-get update && apt-get install --yes --no-install-recommends chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN addgroup --system appuser && adduser --system --ingroup appuser appuser \
    && mkdir -p /home/appuser && chown -R appuser:appuser /home/appuser \
    && mkdir -p /usr/src/app && chown -R appuser:appuser /usr/src/app

USER appuser

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]