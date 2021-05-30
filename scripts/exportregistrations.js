const path = require("path");
const json2csv = require("json2csv");
const write = require('write');

const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");
const { RegistrationsManager } = require("../services/registrations");

async function run() {
  let registrationsmanager = new RegistrationsManager();
  await registrationsmanager.loadalldata();

  let registrations = registrationsmanager.getallregistrations();
  writeascsv(registrations, `registrations.csv`);

  for (let location of cassini.getlocations()) {
    let localregistrations = registrationsmanager.getallregistrations(location);
    writeascsv(localregistrations, `registrations_${location.replace(' ', '_').toLowerCase()}.csv`);
  }
}

function writeascsv(records, filename) {
  let fields = [
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
  records = records.map(record => record.export());
  let csv = json2csv.parse(records, { delimiter: ";", fields, transforms: [ json2csv.transforms.flatten() ] });
  let filepath = path.join(__dirname, "../data", filename);
  write.sync(filepath, csv);
}

module.exports = run()
