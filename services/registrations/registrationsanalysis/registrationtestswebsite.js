const { RegistrationTest } = require("./registrationtest");

let sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

class WebsiteButNotActive extends RegistrationTest {

  async test(registration) {
    if (registration.subscriber) {
      return registration.subscriber.isactive;
    }
    return true;
  }

}

class WebsiteButNotConsented extends RegistrationTest {

  async test(registration) {
    if (registration.subscriber) {
      return registration.subscriber.isconsented;
    }
    return true;
  }

}

class WebsiteUnknownLocation extends RegistrationTest {

  async test(registration) {
    if (registration.subscriber) {
      return this.services.cassini.getlocations().includes(registration.subscriber.location);
    }
    return true;
  }

}

const discordurls = {
  "Portugal": "https://discord.gg/YxRwpx8Tb6",
  "Greece": "https://discord.gg/cTQfdBH5YX",
  "France": "https://discord.gg/qSUGYtKTJX",
  "Netherlands": "https://discord.gg/QSSYq24Hxt",
  "Slovenia": "https://discord.gg/wC6ER4D28D",
  "Ireland": "https://discord.gg/6PpKrxnf7w",
  "Czech Republic": "https://discord.gg/bgv9QKe5GC",
  "Switzerland": "https://discord.gg/FKXdh8xD4y",
  "Cyprus": "https://discord.gg/MWgRbSc2Eg",
  "Estonia": "https://discord.gg/t9YXAWMWZC",
  "Central Hub": "https://discord.gg/cassinihackathons", 
}

class WebsiteNoDiscordLink extends RegistrationTest {

  async test(registration) {
    if (registration.subscriber && registration.subscriber.isactive) {
      return registration.subscriber.discordurl;
    }
    return true;
  }

  async fix(registration) {
    let properties = { discordurl: discordurls[registration.subscriber.location] };
    let subscriber = await this.services.mailerlite.updatesubscriber(registration, properties);
    return subscriber;
  }

}

class WebsiteWrongDiscordLinkForLocation extends RegistrationTest {


  async test(registration) {
    if (registration.subscriber) {
      if (this.services.cassini.getlocations().includes(registration.subscriber.location)) {
        if (registration.subscriber.discordurl) {
          return registration.subscriber.discordurl === discordurls[registration.subscriber.location]
        }
      }
    }
    return true;
  }

  async fix(registration) {
    let properties = { discordurl: discordurls[registration.subscriber.location] };
    let subscriber = await this.services.mailerlite.updatesubscriber(registration, properties);
    return subscriber;
  }

}

class WebsiteButNotOnEventtia extends RegistrationTest {

  async test(registration) {
    if (registration.subscriber && registration.subscriber.isactive && registration.subscriber.isconsented) {
      return registration.attendee
    }
    return true
  }
  
  async fix(registration) {
    await sleep(5);
    let attendee = await this.services.eventtia.registerattendee(registration.subscriber);
    registration.attendee = attendee;
    return attendee; 
  }

}

module.exports = {
  WebsiteButNotActive,
  WebsiteButNotConsented,
  WebsiteUnknownLocation,
  WebsiteNoDiscordLink,
  WebsiteWrongDiscordLinkForLocation,
  WebsiteButNotOnEventtia
}
