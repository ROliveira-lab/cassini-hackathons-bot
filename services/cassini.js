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

module.exports = {
  getname,
  getshortname,
  gethackathonname,
  gethackathonlocation
}