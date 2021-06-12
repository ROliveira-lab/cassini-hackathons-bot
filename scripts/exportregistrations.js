const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");

async function run() {

  const { RegistrationsManager, RegistrationsExport } = require("../services/registrations");

  let registrationsexport = new RegistrationsExport(new RegistrationsManager({ subscribergroup: cassini.getshortname() }), process.env.DATA_FOLDER);

  registrationsexport.exportascsv(null);

  for (let location of cassini.getlocations()) {
    registrationsexport.exportascsv(location);
  }
}

module.exports = run();
