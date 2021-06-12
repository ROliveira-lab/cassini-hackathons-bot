const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");

async function run() {

  const { RegistrationsManager, RegistrationsExporter } = require("../services/registrations");

  let registrationsexporter = new RegistrationsExporter(new RegistrationsManager({ subscribergroup: cassini.getshortname() }), process.env.DATA_FOLDER);

  registrationsexporter.exportascsv(null);

  for (let location of cassini.getlocations()) {
    registrationsexporter.exportascsv(location);
  }
}

module.exports = run();
