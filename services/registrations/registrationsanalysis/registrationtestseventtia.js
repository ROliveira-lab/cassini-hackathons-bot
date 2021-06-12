const { RegistrationTest } = require("./registrationtest");

let sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

class EventtiaButNotOnWebsite extends RegistrationTest {

  async init() {
    this.eventtiagroup = await this.services.mailerlite.getgroupbyname("Eventtia registrations");
  }

  async test(registration) {
    if (registration.attendee && registration.attendee.isactive) {
      return registration.subscriber;
    }
    return true;
  }

  async fix(registration) {
    let subscribergroups = await this.services.mailerlite.getgroupsofsubscriber(registration.attendee.email);
    if (subscribergroups) {
      for (let group of subscribergroups) {
        await this.services.mailerlite.removesubscriberfromgroup(group.id, registration.attendee.email);
      }
      await sleep(10);
    }
    let subscriber = await this.services.mailerlite.addnewsubscribertogroup(this.eventtiagroup.id, registration.attendee);
    registration.subscriber = subscriber
    return subscriber
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
    if (registration.attendee && registration.attendee.isactive && registration.subscriber) {
      return registration.attendee.location === registration.subscriber.location;
    }
    return true;
  }

  async fix(registration) {
    console.log(`Update ${registration.email} eventtia location from ${registration.attendee.location} to ${registration.subscriber.location}`);
    return false;
  }

}

module.exports = {
  EventtiaButNotOnWebsite,
  EventtiaOnWebsiteButNotActive,
  EventtiaOnWebsiteButNotConsented,
  EventtiaDifferentLocationAsOnWebsite
}
