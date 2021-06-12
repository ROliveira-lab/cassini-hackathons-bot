const { RegistrationTest } = require("./registrationtest");

class EventtiaButNotOnWebsite extends RegistrationTest {

  async test(registration) {
    if (registration.attendee) {
      return registration.subscriber;
    }
    return true;
  }

}

class EventtiaOnWebsiteButNotActive extends RegistrationTest {

  async test(registration) {
    if (registration.attendee && registration.subscriber) {
      return registration.subscriber.isactive;
    }
    return true;
  }

}

class EventtiaOnWebsiteButNotConsented extends RegistrationTest {

  async test(registration) {
    if (registration.attendee && registration.subscriber) {
      return registration.subscriber.isconsented;
    }
    return true;
  }

}

class EventtiaDifferentLocationAsOnWebsite extends RegistrationTest {

  async test(registration) {
    if (registration.attendee && registration.subscriber) {
      return registration.attendee.location === registration.subscriber.location;
    }
    return true;
  }

  async fix(registration) {
    console.log(`Update ${registration.email} eventtia location to ${registration.subscriber.location}`);
    return false;
  }

}

module.exports = {
  EventtiaButNotOnWebsite,
  EventtiaOnWebsiteButNotActive,
  EventtiaOnWebsiteButNotConsented,
  EventtiaDifferentLocationAsOnWebsite
}
