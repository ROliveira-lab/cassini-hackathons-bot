const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");
const { RegistrationsManager, RegistrationsExporter } = require("../services/registrations");

async function run() {

  let registrationsmanager = new RegistrationsManager();
  
  await registrationsmanager.loadalldata();

  let registrationsexporter = new RegistrationsExporter(registrationsmanager, process.env.DATA_FOLDER);

  registrationsexporter.exportascsv(null);

  for (let location of cassini.getlocations()) {
    registrationsexporter.exportascsv(location);
  }
}

module.exports = run();
