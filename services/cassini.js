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

function coreteammemberlabel() {
  return "Core Team Member";
}

function localorganiserlabel() {
  return "Local Organiser";
}

function crewmemberlabel() {
  return "Crew Member";
}

function hackerlabel() {
  return "Hacker";
}

function visitorlabel() {
  return "Visitor";
}

function iscoreteammember(rolenames) {
  return rolenames.includes("Core Team Member");
}

function islocalorganiser(rolenames) {
  return rolenames.includes("Local Organiser");
}

function iscrewmember(rolenames) {
  return rolenames.includes("Crew Member");
}

function getcrewmemberlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Crew Member (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location);
}

function ishacker(rolenames) {
  return rolenames.includes("Hacker");
}

function gethackerlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Hacker (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location);
}

function isvisitor(rolenames) {
  return rolenames.includes("Visitor");
}

function getvisitorlocation(rolenames) {
  return rolenames.map((role) => role.match(/^Visitor (\w.*)$/)).reduce((location, matchresult) => matchresult ? matchresult[1] : location);
}

module.exports = {
  getname,
  getshortname,
  gethackathonname,
  gethackathonlocation,
  defaulthackathonlocation,
  getlocations,
  coreteammemberlabel,
  localorganiserlabel,
  crewmemberlabel,
  hackerlabel,
  visitorlabel,
  iscoreteammember,
  islocalorganiser,
  iscrewmember,
  getcrewmemberlocation,
  ishacker,
  gethackerlocation,
  isvisitor,
  getvisitorlocation
}