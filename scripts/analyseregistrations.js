const dotenv = require("dotenv");

dotenv.config();

async function run(names, options) {

  const { RegistrationsManager, RegistrationsAnalysis } = require("../services/registrations");

  let registrationsmanager = new RegistrationsManager();

  const registrationsanalysis = new RegistrationsAnalysis(registrationsmanager);

  await registrationsanalysis.run(names, options);

}

function list() {

  const { RegistrationsAnalysis } = require("../services/registrations/registrationsanalysis");

  const registrationsanalysis = new RegistrationsAnalysis(null);

  registrationsanalysis.listavailabletests();

}

const minimist = require('minimist');

let argv = minimist(process.argv.slice(2), { boolean: true })

if (argv.list) {
  list();
} else {
  run(argv._, argv);
}
