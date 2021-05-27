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

let locations = [
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
  return locations;
}

module.exports = {
  getname,
  getshortname,
  gethackathonname,
  gethackathonlocation,
  defaulthackathonlocation,
  getlocations
}