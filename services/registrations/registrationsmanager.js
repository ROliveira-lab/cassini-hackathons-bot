const cassini = require("../cassini");
const mailerlite = require("../mailerlite");
const junction = require("../junction");
const eventtia = require("../eventtia");

class RegistrationsManager {

  constructor(filteroptions) {
    this.location = filteroptions.location;
    this.subscribergroup = filteroptions.subscribergroup;
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

  async loadall() {
    if (!this.loading) {
      this.loading = Promise.all([
        this.loadallsubscribers(),
        this.loadallparticipants(),
        this.loadallattendees()
      ]);
    }
    return this.loading;
  }

  async loadallsubscribers() {
    if (this.subscribergroup) {
      let group = await mailerlite.getgroupbyname(this.subscribergroup);
      var subscribers = await mailerlite.getsubscribersingroup(group.id, null);
    } else {
      var subscribers = await mailerlite.getsubscribers(null);
    }
    subscribers = subscribers.filter((subscriber) => subscriber.status != "unsubscribed");
    subscribers = this.location ? subscribers.filter((subscriber) => subscriber.location === this.location) : subscribers;
    for (let subscriber of subscribers) {
      this.addsubscriber(subscriber);
    }
  }

  async loadallparticipants() {
    let participants = await junction.getparticipants();
    participants = this.location ? participants.filter((participant) => participant.location === this.location) : participants;
    for (let participant of participants) {
      this.addparticipant(participant);
    }
  }

  async loadallattendees() {
    let attendees = await eventtia.getattendees();
    attendees = this.location ? attendees.filter((attendee) => attendee.location === this.location) : attendees;
    for (let attendee of attendees) {
      this.addattendee(attendee);
    }
  }

  async loadone(email) {
    await Promise.all([
      this.loadonesubscriber(email),
      this.loadoneparticipant(email),
      this.loadoneattendee(email)
    ]);
  }

  async loadonesubscriber(email) {
    let subscriber = await mailerlite.getsubscriber(email);
    if (!subscriber) { return; }
    if (this.subscribergroup) {
      let subscribergroups = await mailerlite.getgroupsofsubscriber(email);
      if (!subscribergroups.find((subscribergroup) => subscribergroup.name === this.subscribergroup)) { return; }
    }
    if (this.location && subscriber.location !== this.location) { return; }
    this.addsubscriber(subscriber);
  }

  async loadoneparticipant(email) {
    let participant = await junction.getparticipantbyemail(email);
    if (!participant) { return undefined; }
    if (this.location && attendee.location !== this.location) { return; }
    this.addparticipant(participant);
  }

  async loadoneattendee(email) {
    let attendee = await eventtia.getattendeebyemail(email);
    if (!attendee) { return; }
    if (this.location && attendee.location !== this.location) { return; }
    this.addattendee(attendee);
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
