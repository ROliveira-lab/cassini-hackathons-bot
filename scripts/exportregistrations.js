const path = require("path");

const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");
const { RegistrationsManager } = require("../services/registrations");

async function run() {
  let registrationsmanager = new RegistrationsManager();
  await registrationsmanager.loadalldata();

  registrationsmanager.exportascsv(path.join(__dirname, "../data", "registrations.csv"));

  for (let location of cassini.getlocations()) {
    registrationsmanager.exportascsv(path.join(__dirname, "../data", `registrations_${location.replace(' ', '_').toLowerCase()}.csv`), location);
  }
}

module.exports = run()
