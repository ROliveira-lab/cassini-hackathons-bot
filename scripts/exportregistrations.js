const path = require("path");
const json2csv = require("json2csv");
const write = require('write');

const dotenv = require("dotenv");

dotenv.config();

const cassini = require("../services/cassini");
const registrations = require("../services/registrations");

async function run() {
  let subscribers = await registrations.website.getregistrations()
  let participants = await registrations.hackathonplatform.getregistrations();
  let attendees = await registrations.eventplatform.getregistrations();

  let records = matchonemail(subscribers, participants, attendees);

  writeascsv(records, `registrations.csv`);

  for (let location of cassini.getlocations()) {
    let localrecords = filterlocal(records, location);
    if (localrecords.length > 0) {
      writeascsv(localrecords, `registrations_${location.replace(' ', '_').toLowerCase()}.csv`);
    }
  }
}

function matchonemail(subscribers, participants, attendees) {
  let result = {}
  addtoresult("website", subscribers, result);
  addtoresult("junction", participants, result);
  addtoresult("eventtia", attendees, result);
  return Object.values(result);
}

function addtoresult(key, registrations, result) {
  for (let registration of registrations) {
    if (!(registration.email in result)) {
      result[registration.email] = {};
    }
    result[registration.email][key] = registration.export();
  }
  return result;
}

function filterlocal(records, location) {
  return records.filter(record => record.website?.location === location || record.junction?.location === location || record.eventtia?.location === location);
}

function writeascsv(records, filename) {
  let fields = ["website.firstname", "website.lastname", "website.email", "website.country", "website.location", "website.status", "website.consent", "junction.firstname", "junction.lastname", "junction.email", "junction.location", "junction.status", "eventtia.firstname", "eventtia.lastname", "eventtia.email", "eventtia.location"];
  let csv = json2csv.parse(records, { delimiter: ";", fields, transforms: [ json2csv.transforms.flatten() ] });
  let filepath = path.join(__dirname, "../data", filename);
  write.sync(filepath, csv);
}

module.exports = run()
