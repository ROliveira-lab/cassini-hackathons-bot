const dotenv = require("dotenv");

dotenv.config();

async function run(names, options) {

  const { RegistrationsManager, RegistrationsAnalysis } = require("../services/registrations");

  let registrationsmanager = new RegistrationsManager();

  const registrationsanalysis = new RegistrationsAnalysis(registrationsmanager);

  await registrationsanalysis.run(names, options);

}

const minimist = require('minimist');

let argv = minimist(process.argv.slice(2), { boolean: true })

run(argv._, argv);
