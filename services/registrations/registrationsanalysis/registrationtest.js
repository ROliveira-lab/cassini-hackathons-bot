const chalk = require('chalk');

class RegistrationTest {
  
  constructor(services) {
    this.services = services;
    this.results = [];
    this.cache = {}
  }

  get total() {
    return this.results.length;
  }

  get passed() {
    return this.results.filter((result) => result.pass).length;
  }

  get failed() {
    return this.results.filter((result) => !result.pass && !result.fixed).length;
  }

  get fixed() {
    return this.results.filter((result) => !result.pass && result.fixed).length;
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
