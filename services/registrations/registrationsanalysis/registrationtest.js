const chalk = require('chalk');

class RegistrationTest {
  
  constructor(services) {
    this.services = services;
    this.results = [];
  }

  async run(registration, fix = false) {
    var pass = await this.test(registration);
    if (!pass && fix && this.fix) {
      var fixed = await this.fix(registration);
    }
    let result = { registration, pass: !!pass, fixed: !!fixed }
    this.results.push(result);
    return result;
  }

}

module.exports = { RegistrationTest }
