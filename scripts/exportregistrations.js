const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");

async function run() {

  const { RegistrationsManager, RegistrationsExport } = require("../services/registrations");

  let registrationsmanager = new RegistrationsManager({ subscribergroup: cassini.getshortname(), nounsubscribed: true });

  let registrationsexport = new RegistrationsExport(registrationsmanager, process.env.DATA_FOLDER);

  registrationsexport.exportascsv(null);

  for (let location of cassini.getlocations()) {

    registrationsexport.exportascsv(location);
    
  }
}

module.exports = run();
