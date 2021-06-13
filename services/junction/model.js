const cassini = require("../cassini");
const moment = require("moment");

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
    return this.participant.user;
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

  get isincomplete() {
    return this.status === "incomplete";
  }

  get ispending() {
    return this.status === "pending";
  }

  get isaccepted() {
    return this.status === "softaccepted" || this.status === "accepted";
  }

  get isrejected() {
    return this.status === "softrejected" || this.status === "rejected";
  }

  get isconfirmed() {
    return this.status === "confirmed";
  }

  get iscancelled() {
    return this.status === "cancelled";
  }

  get ischeckedin() {
    return this.status === "checkedin";
  }

  get isnoshow() {
    return this.status === "noshow";
  }

  get isactive() {
    return this.ischeckedin || this.isincomplete || this.ispending || this.isaccepted || this.isconfirmed;
  }

  get tags() {
    return this.participant.tags;
  }

  checkeligibity() {
    let residencerequirement = cassini.eligiblecountries().includes(this.countryofresidence);
    let agerequirement = moment(this.birthdate).isSameOrBefore(cassini.eligiblebirthdate());
    return residencerequirement && agerequirement;
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
