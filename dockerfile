FROM node:lts-buster-slim

RUN apt-get update && apt-get install --yes --no-install-recommends chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

ENV HOME_FOLDER=/home/appuser DATA_FOLDER=/home/appuser/data APP_FOLDER=/usr/src/app

RUN addgroup --system appuser && adduser --system --ingroup appuser appuser \
    && mkdir -p $HOME_FOLDER && chown -R appuser:appuser $HOME_FOLDER \
    && mkdir -p $DATA_FOLDER && chown -R appuser:appuser $DATA_FOLDER \
    && mkdir -p $APP_FOLDER && chown -R appuser:appuser $APP_FOLDER

USER appuser

WORKDIR $APP_FOLDER

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]