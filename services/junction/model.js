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

  get created() {
    return this.participant.createdAt;
  }

  get updated() {
    return this.participant.updatedAt;
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

  get countryofresidence() {
    return this.participant.answers.countryOfResidence;
  }

  get birthdate() {
    return this.participant.answers.dateOfBirth;
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
      countryofresidence: this.countryofresidence,
      birthdate: this.birthdate,
      location: this.location,
      status: this.status
    }
  }
}

module.exports = { Event, Participant }
