const dotenv = require("dotenv");

dotenv.config();

async function analyse(names, options) {

  const { RegistrationsManager, RegistrationsAnalysis } = require("../services/registrations");

  const registrationsanalysis = new RegistrationsAnalysis(new RegistrationsManager());

  await registrationsanalysis.run(names, options);

}

const minimist = require('minimist');

let argv = minimist(process.argv.slice(2), { boolean: true })

analyse(argv._, argv);
