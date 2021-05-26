class Registration { }

class WebsiteRegistration extends Registration {

  constructor(subscriber) {
    this.subscriber = subscriber;
  }

  get firstname() {
    return this.subscriber.firstname;
  }

  get lastname() {
    return this.subscriber.lastname;
  }

  get email() {
    return this.subscriber.email;
  }

  get location() {
    return this.subscriber.location;
  }

}

class HackathonPlatformRegistration extends Registration {

  constructor(participant) {
    this.participant = participant;
  }

  get firstname() {
    return this.participant.firstname;
  }

  get lastname() {
    return this.participant.lastname;
  }

  get email() {
    return this.participant.email;
  }

  get location() {
    return this.participant.location;
  }

}

class EventPlatformRegistration extends Registration {

  constructor(attendee, attendeetype) {
    this.attendee = attendee;
    this.attendeetype = attendeetype;
  }

  get firstname() {
    return this.attendee.firstname;
  }

  get lastname() {
    return this.attendee.lastname;
  }

  get email() {
    return this.attendee.email;
  }

  get location() {
    return this.attendeetype.location;
  }

}

module.exports = { WebsiteRegistration, HackathonPlatformRegistration, EventPlatformRegistration }
