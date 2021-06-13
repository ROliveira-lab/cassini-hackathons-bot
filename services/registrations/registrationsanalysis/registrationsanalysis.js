const chalk = require('chalk');

class RegistrationsAnalysis {

  constructor(registrationsmanager) {
    this.registrationsmanager = registrationsmanager;
  }

  async run(names, options) {

    console.log("REGISTRATIONS ANALYSIS")
    console.log("");
  
    let tests = this.preparetestrun(names);
  
    if (tests.length > 0) {

      console.log("Loading all registrations data ...")

      await this.registrationsmanager.loadall();
  
      let registrations = this.registrationsmanager.getallregistrations();

      console.log("All registrations data loaded!")
      console.log("");

      for (let test of tests) {

        console.log(chalk.bold(test.constructor.name));

        if (test.init) { await test.init(); }

        for (let registration of registrations) {

          let result = await test.run(registration, options.fix);

          if (result.pass && options.showall) {
            console.log(chalk.green(`${result.registration.email} PASS`));
          } else if (!result.pass && !result.fixed) {
            console.log(chalk.red(`${result.registration.email} FAIL`));
          } else if (!result.pass && result.fixed) {
            console.log(chalk.blue(`${result.registration.email} FIXED`));
          }
        
        }

        console.log("");

        console.log(`${test.passed}/${test.total} registrations passed`);
        console.log(`${test.failed}/${test.total} registrations failed`);
        if (options.fix) {
          console.log(`${test.fixed}/${test.total} registrations fixed`);
        }

        console.log("");

      }

    }
  
  }

  preparetestrun(names) {
    let testclasses = importtests();
    console.log("New test run:");
    let tests = []
    for (let name of names) {
      if (name in testclasses) {
        let testclass = testclasses[name];
        console.log(`- ${testclass.name}`);
        let services = importservices();
        let test = new testclass(services)
        tests.push(test);
      }
    }
    console.log("");
    return tests;
  }

}

function importtests() {
  let testclassgroups = [
    require("./registrationtestswebsite"),
    require("./registrationtestseventtia"),
    require("./registrationtestsjunction"),
  ]
  let testclasses = Object.assign({}, ...testclassgroups);
  return testclasses;
}

function importservices() {
  const cassini = require("../../cassini");
  const mailerlite = require("../../mailerlite");
  const eventtia = require("../../eventtia");
  const junction = require("../../junction");
  return { cassini, mailerlite, eventtia, junction };
}


module.exports = { RegistrationsAnalysis }
