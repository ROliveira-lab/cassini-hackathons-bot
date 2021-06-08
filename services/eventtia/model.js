const cassini = require("../cassini");

class Event {

  constructor(event) {
    this.event = event;
  }

  get id() {
    return this.event.id;
  }

  get name() {
    return this.event.attributes.name;
  }

  get slug() {
    return this.event.attributes.event_uri;
  }

  get apikey() {
    return this.event.attributes.api_key;
  }

}

class AttendeeType {

  constructor(attendeetype) {
    this.attendeetype = attendeetype;
  }

  get id() {
    return this.attendeetype.id;
  }

  get name() {
    return this.attendeetype.attributes.name;
  }

  get location() {
    return cassini.gethackathonlocation(this.attendeetype.attributes.name);
  }

}

class Attendee {

  constructor(attendee, attendeetype = undefined) {
    this.attendee = attendee;
    this.attendeetype = attendeetype;
  }

  get id() {
    return this.attendee.id;
  }

  get attendeetypeid() {
    return this.attendee.relationships.attendee_type.data.id;
  }

  get created() {
    return this.attendee.attributes.created_at;
  }

  get updated() {
    return this.attendee.attributes.updated_at;
  }

  get firstname() {
    return Object.values(this.attendee.attributes.fields)[0];
  }

  get lastname() {
    return Object.values(this.attendee.attributes.fields)[1];
  }

  get email() {
    return Object.values(this.attendee.attributes.fields)[2];
  }

  get location() {
    return this.attendeetype?.location;
  }

  get status() {
    return this.attendee.attributes.status.toLowerCase()
  }

  get isactive() {
    return this.attendee.attributes.status === "confirmed";
  }

  export() {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      location: this.location
    }
  }
}

class Activity {

  constructor(activity) {
    this.activity = activity;
  }

  get id() {
    return this.activity.id;
  }

  get name() {
    return this.activity.attributes.name;
  }

  get isregistrationneeded() {
    return this.activity.attributes.show_on_register;
  }

  get allowedattendeetypeids() {
    return Object.keys(this.activity.attributes.price);
  }

  canregister(subject) {
    if (!this.isregistrationneeded) return false;
    if (subject instanceof Attendee) { return this.allowedattendeetypeids.includes(subject.attendeetypeid); }
    else if (subject instanceof AttendeeType) { return this.allowedattendeetypeids.includes(subject.attendeetypeid); }
    else if (typeof subject === "string") { return subject in this.allowedattendeetypeids; }
  }
}

module.exports = { Event, AttendeeType, Attendee, Activity }
