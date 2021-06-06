const flatten = require("flat");
const json2csv = require("json2csv");
const write = require('write');
const path = require("path");

let fields = [
  "canbecontacted",
  "website.firstname",
  "website.lastname",
  "website.email",
  "website.countryofip",
  "website.location",
  "website.status",
  "website.consent",
  "junction.firstname",
  "junction.lastname",
  "junction.email",
  "junction.countryofresidence",
  "junction.birthdate",
  "junction.location",
  "junction.status",
  "eventtia.firstname",
  "eventtia.lastname",
  "eventtia.email",
  "eventtia.location"
];

class RegistrationsExporter {

  constructor(registrationsmanager, path) {
    this.registrationsmanager = registrationsmanager;
    this.path = path;
  }

  filename(location, tags) {
    let filenameparts = ["registrations"]
    filenameparts.push(location ? location.replace(' ', '_').toLowerCase() : "all");
    filenameparts.push(...tags);
    return filenameparts.join('_') + ".csv";
  }

  filepath(location, tags) {
    let filename = this.filename(location, tags);
    return path.join(this.path, filename);
  }

  async exportascsv(location = undefined, tags = []) {
    let registrations = this.registrationsmanager.getallregistrations(location);
    let records = registrations.map((registration) => flatten(registration.export()));
    let csv = json2csv.parse(records, { delimiter: ";", fields });
    await write(this.filepath(location, tags), csv);
    return csv;
  }
}

module.exports = { RegistrationsExporter }
