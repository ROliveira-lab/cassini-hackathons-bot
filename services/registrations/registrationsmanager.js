const cassini = require("../cassini");
const mailerlite = require("../mailerlite");
const junction = require("../junction");
const eventtia = require("../eventtia");

class RegistrationsManager {

  constructor() {
    this.registrations = {};
    this.loading = undefined;
  }

  hasregistration(email) {
    return email in this.registrations;
  }

  getregistration(email, location = undefined) {
    let registration = this.registrations[email];
    return location ? (registration.matcheslocation(location) ? registration : undefined) : registration;
  }

  getallregistrations(location = undefined) {
    let registrations = Object.values(this.registrations);
    return location ? registrations.filter(registration => registration.matcheslocation(location)) : registrations;
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


  async loadall(location = undefined) {
    if (!this.loading) {
      this.loading = Promise.all([
        this.loadallsubscribers(location),
        this.loadallparticipants(location),
        this.loadallattendees(location)
      ]);
    }
    return this.loading;
  }

  async loadallsubscribers(location = undefined) {
    let group = await mailerlite.getgroupbyname(cassini.getshortname());
    let subscribers = await mailerlite.getsubscribersingroup(group.id, null);
    subscribers = subscribers.filter((subscriber) => subscriber.status != "unsubscribed");
    subscribers = location ? subscribers.filter(r => r.location === location) : subscribers;
    for (let subscriber of subscribers) {
      this.addsubscriber(subscriber);
    }
  }

  async loadallparticipants(location = undefined) {
    let participants = await junction.getparticipants();
    participants = location ? participants.filter(r => r.location === location) : participants;
    for (let participant of participants) {
      this.addparticipant(participant);
    }
  }

  async loadallattendees(location = undefined) {
    let attendees = await eventtia.getattendees();
    attendees = location ? attendees.filter(r => r.location === location) : attendees;
    for (let attendee of attendees) {
      this.addattendee(attendee);
    }
  }

  async loadone(email, location = undefined) {
    await Promise.all([
      this.loadonesubscriber(email, location),
      this.loadoneparticipant(email, location),
      this.loadoneattendee(email, location)
    ]);
  }

  async loadonesubscriber(email, location = undefined) {
    let subscriber = await mailerlite.getsubscriber(email);
    if (!subscriber) { return; }
    let group = await mailerlite.getgroupbyname(cassini.getshortname());
    let subscribergroups = await mailerlite.getgroupsofsubscriber(email);
    if (!subscribergroups.find((subscribergroup) => subscribergroup.name === group.name)) { return; }
    if (location && subscriber.location !== location) { return; }
    this.addsubscriber(subscriber);
  }

  async loadoneparticipant(email, location = undefined) {
    let participant = await junction.getparticipantbyemail(email);
    if (!participant) { return undefined; }
    if (location && attendee.location !== location) { return; }
    this.addparticipant(participant);
  }

  async loadoneattendee(email, location = undefined) {
    let attendee = await eventtia.getattendeebyemail(email);
    if (!attendee) { return; }
    if (location && attendee.location !== location) { return; }
    this.addattendee(attendee);
  }

  async findregistration(email, location = undefined) {
    let [subscriber, participant, attendee] = await Promise.all([
      website.findregistration(email, location),
      hackathonplatform.findregistration(email, location),
      eventplatform.findregistration(email, location)
    ]);
    let registration = new Registration(email, { subscriber, participant, attendee });
    return registration.exists ? this.addregistration(registration) : undefined
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

  get exists() {
    return !!this.subscriber || !!this.participant || !!this.attendee;
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
