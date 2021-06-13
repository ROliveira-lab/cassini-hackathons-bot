const moment = require("moment");

function getname() {
  return "CASSINI Hackathons & Mentoring";
}

function getshortname() {
  return "CASSINI Hackathons";
}

function gethackathonname(location) {
  if (location === "Central Hub") { return "Central Hub" }
  return `Hackathon ${location}`;
}

function gethackathonlocation(name) {
  if (name === "Central Hub") { return "Central Hub" }
  let matchresult = name.match(/^Hackathon (\w.*)$/);
  return matchresult ? matchresult[1] : null;
}

function defaulthackathonlocation() {
  return "Central Hub";
}

let alllocations = [
  "Portugal",
  "Greece",
  "France",
  "Netherlands",
  "Slovenia",
  "Ireland",
  "Czech Republic",
  "Switzerland",
  "Cyprus",
  "Estonia",
  "Central Hub"
];

function getlocations() {
  return alllocations;
}

function getnames() {
  return alllocations.map((location) => gethackathonname(location));
}

function coreteammemberlabel() {
  return "Core Team Member";
}

function localorganiserlabel() {
  return "Local Organiser";
}

function crewmemberlabel(location = undefined) {
  return location ? `Crew Member ${location}` : "Crew Member";
}

function expertlabel(location = undefined) {
  return location ? `Expert ${location}` : "Expert";
}

function hackerlabel(location = undefined) {
  return location ? `Hacker ${location}` : "Hacker";
}

function visitorlabel(location = undefined) {
  return location ? `Visitor ${location}` : "Visitor";
}

function getallaccesslevels(location = undefined) {
  return [
    visitorlabel(),
    hackerlabel(),
    expertlabel(),
    crewmemberlabel(),
    localorganiserlabel(),
    coreteammemberlabel()
  ]
}

function getassignableaccesslevels(location = undefined) {
  return [
    visitorlabel(),
    hackerlabel(),
    expertlabel(),
    crewmemberlabel()
  ]
}


function iscoreteammember(rolenames) {
  return rolenames.includes(coreteammemberlabel());
}

function islocalorganiser(rolenames) {
  return rolenames.includes(localorganiserlabel());
}

function iscrewmember(rolenames) {
  return rolenames.find((rolename) => rolename.startsWith(crewmemberlabel())) != undefined;
}

function getcrewmemberlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Crew Member (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location, undefined);
}

function isexpert(rolenames) {
  return rolenames.find((rolename) => rolename.startsWith(expertlabel())) != undefined;
}

function getexpertlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Expert (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location, undefined);
}

function ishacker(rolenames) {
  return rolenames.find((rolename) => rolename.startsWith(hackerlabel())) != undefined;
}

function gethackerlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Hacker (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location, undefined);
}

function isvisitor(rolenames) {
  return rolenames.find((rolename) => rolename.startsWith(visitorlabel())) != undefined;
}

function getvisitorlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Visitor (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location, undefined);
}

function eligiblebirthdate() {
  return moment().subtract(18, 'years');
}

function eligiblecountries() {
  return [
    "Austria",	
    "Belgium",
    "Bulgaria",
    "Croatia",
    "Cyprus",
    "Czechia",	
    "Denmark",
    "Estonia",	
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",	
    "Ireland",
    "Italy",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Netherlands",
    "Norway",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland"
  ]
}

module.exports = {
  getname,
  getshortname,
  gethackathonname,
  gethackathonlocation,
  defaulthackathonlocation,
  getlocations,
  getnames,
  coreteammemberlabel,
  localorganiserlabel,
  crewmemberlabel,
  expertlabel,
  hackerlabel,
  visitorlabel,
  getallaccesslevels,
  getassignableaccesslevels,
  iscoreteammember,
  islocalorganiser,
  iscrewmember,
  getcrewmemberlocation,
  isexpert,
  getexpertlocation,
  ishacker,
  gethackerlocation,
  isvisitor,
  getvisitorlocation,
  eligiblebirthdate,
  eligiblecountries
}