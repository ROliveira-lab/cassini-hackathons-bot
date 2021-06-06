const flatten = require('flat');
const json2csv = require("json2csv");
const write = require('write');

const website = require("./website");
const hackathonplatform = require("./hackathonplatform");
const eventplatform = require("./eventplatform");

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

class RegistrationsManager {

  constructor() {
    this.registrations = {};
  }

  hasregistration(email) {
    return email in this.registrations;
  }

  getregistration(email) {
    return this.registrations[email];
  }

  addregistration(registration) {
    this.registrations[registration.email] = registration;
    return registration;
  }

  getorcreateregistration(email) {
    if (this.hasregistration(email)) {
      return this.getregistration(email);
    } else {
      return this.addregistration(new Registration(email));
    }
  }

  addsubscriber(subscriber) {
    let registration = this.getorcreateregistration(subscriber.email);
    registration.subscriber = subscriber;
  }

  addparticipant(participant) {
    let registration = this.getorcreateregistration(participant.email);
    registration.participant = participant;
  }

  addattendee(attendee) {
    let registration = this.getorcreateregistration(attendee.email);
    registration.attendee = attendee;
  }

  async loadsubscribers() {
    let subscribers = await website.getregistrations()
    for (let subscriber of subscribers) {
      this.addsubscriber(subscriber);
    }
  }

  async loadparticipants() {
    let participants = await hackathonplatform.getregistrations();
    for (let participant of participants) {
      this.addparticipant(participant);
    }
  }

  async loadattendees() {
    let attendees = await eventplatform.getregistrations();
    for (let attendee of attendees) {
      this.addattendee(attendee);
    }
  }

  async loadalldata() {
    await Promise.all([this.loadsubscribers(), this.loadparticipants(), this.loadattendees()]);
  }

  getallregistrations(location = undefined) {
    let registrations = Object.values(this.registrations);
    return location ? registrations.filter(registration => registration.matcheslocation(location)) : registrations;
  }

  async exportascsv(filepath, location = undefined) {
    let records = this.getallregistrations(location).map((registration) => flatten(registration.export()));
    let csv = json2csv.parse(records, { delimiter: ";", fields });
    await write(filepath, csv);
  }

}

class Registration {

  constructor(email, data) {
    this.email = email;
    this.subscriber = data?.subscriber;
    this.participant = data?.participant;
    this.attendee = data?.attendee;
  }

  get canbecontacted() {
    return this.subscriber ? this.subscriber.isconsented && this.subscriber.isactive : false;
  }

  matcheslocation(location) {
    return this.subscriber?.location === location || this.participant?.location === location || this.attendee?.location === location;
  }

  export() {
    let record = {
      email: this.email,
      canbecontacted: this.canbecontacted,
      website: this.subscriber?.export(),
      junction: this.participant?.export(),
      eventtia: this.attendee?.export()
    }
    return record;
  }

}

module.exports = {
  RegistrationsManager,
  Registration
}
