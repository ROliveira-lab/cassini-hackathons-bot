const { RegistrationTest } = require("./registrationtest");

let sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

class JunctionButNotOnWebsite extends RegistrationTest {

  async init() {
    this.junctiongroup = await this.services.mailerlite.getgroupbyname("Junction registrations");
  }

  async test(registration) {
    if (registration.participant && registration.participant.isactive) {
      return registration.subscriber;
    }
    return true;
  }

  async fix(registration) {
    let subscribergroups = await this.services.mailerlite.getgroupsofsubscriber(registration.participant.email);
    if (subscribergroups) {
      for (let group of subscribergroups) {
        await this.services.mailerlite.removesubscriberfromgroup(group.id, registration.participant.email);
      }
      await sleep(10);
    }
    let subscriber = await this.services.mailerlite.addnewsubscribertogroup(this.junctiongroup.id, registration.participant);
    registration.subscriber = subscriber
    return subscriber
  }

}

class JunctionOnWebsiteButNotActive extends RegistrationTest {

  async test(registration) {
    if (registration.participant && registration.subscriber) {
      return registration.subscriber.isactive;
    }
    return true;
  }

}

class JunctionOnWebsiteButNotConsented extends RegistrationTest {

  async test(registration) {
    if (registration.participant && registration.subscriber) {
      return registration.subscriber.isconsented;
    }
    return true;
  }

}

class JunctionDifferentLocationAsOnWebsite extends RegistrationTest {

  async test(registration) {
    if (registration.participant && registration.participant.isactive && registration.subscriber) {
      return registration.participant.location === registration.subscriber.location;
    }
    return true;
  }

  async fix(registration) {
    console.log(`Update ${registration.email} junction location from ${registration.participant.location} to ${registration.subscriber.location}`);
    return false;
  }

}

module.exports = {
  JunctionButNotOnWebsite,
  JunctionOnWebsiteButNotActive,
  JunctionOnWebsiteButNotConsented,
  JunctionDifferentLocationAsOnWebsite
}
