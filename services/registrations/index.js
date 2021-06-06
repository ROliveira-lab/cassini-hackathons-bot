const website = require("./website");
const hackathonplatform = require("./hackathonplatform");
const eventplatform = require("./eventplatform");

const { RegistrationsManager, Registration } = require("./registrationsmanager");

const { RegistrationsReport } = require("./registrationsreport");

module.exports = {
  website,
  hackathonplatform,
  eventplatform,
  RegistrationsManager,
  Registration,
  RegistrationsReport
}
