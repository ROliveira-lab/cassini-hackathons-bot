const cassini = require("../cassini");

class Event {

  constructor(event) {
    this.event = event;
  }

  get name() {
    return this.event.name;
  }

  get slug() {
    return this.event.slug;
  }

}

class Participant {

  constructor(participant) {
    this.participant = participant;
  }

  get id() {
    return undefined;
  }

  get firstname() {
    return this.participant.answers.firstName;
  }

  get lastname() {
    return this.participant.answers.lastName;
  }

  get email() {
    return this.participant.answers.email;
  }

  get location() {
    return this.participant.answers.CustomAnswers.find((answer) => answer.key === "hackathon-location")?.value;
  }

  get status() {
    return this.participant.status.toLowerCase();
  }

  get iscomplete() {
    return this.participant.status != "incomplete";
  }

  export() {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      location: this.location,
      status: this.status
    }
  }
}

module.exports = { Event, Participant }
