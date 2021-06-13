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

class JunctionOnWebsiteButUnconfirmed extends RegistrationTest {

  async init() {
    let group = await this.services.mailerlite.getgroupbyname(this.services.cassini.getshortname());
    let subscribers = await this.services.mailerlite.getsubscribersingroup(group.id, null);
    this.selectedsubscriberids = subscribers.map((subscriber) => subscriber.id);
  }

  async test(registration) {
    if (registration.participant && registration.subscriber && this.selectedsubscriberids.includes(registration.subscriber.id)) {
      return !registration.subscriber.isunconfirmed;
    }
    return true;
  }

}

class JunctionOnWebsiteButUnsubscribed extends RegistrationTest {

  async init() {
    let group = await this.services.mailerlite.getgroupbyname(this.services.cassini.getshortname());
    let subscribers = await this.services.mailerlite.getsubscribersingroup(group.id, null);
    this.selectedsubscriberids = subscribers.map((subscriber) => subscriber.id);
  }

  async test(registration) {
    if (registration.participant && registration.subscriber && this.selectedsubscriberids.includes(registration.subscriber.id)) {
      return !registration.subscriber.isunsubscribed;
    }
    return true;
  }

}

class JunctionOnWebsiteButNotConsented extends RegistrationTest {

  async init() {
    let group = await this.services.mailerlite.getgroupbyname(this.services.cassini.getshortname());
    let subscribers = await this.services.mailerlite.getsubscribersingroup(group.id, null);
    this.selectedsubscriberids = subscribers.map((subscriber) => subscriber.id);
  }

  async test(registration) {
    if (registration.participant && registration.subscriber && this.selectedsubscriberids.includes(registration.subscriber.id)) {
      return registration.subscriber.isconsented;
    }
    return true;
  }

}

class JunctionCheckedInButNoLocation extends RegistrationTest {

  async test(registration) {
    if (registration.participant && registration.participant.ischeckedin) {
      return registration.participant.location;
    }
    return true;
  }

  async fix(registration) {
    return await this.services.junction.updateparticipant(registration.participant, { status: "incomplete" });
  }

}

class JunctionDifferentLocationAsOnWebsite extends RegistrationTest {

  async test(registration) {
    if (registration.participant && registration.participant.isactive && registration.participant.location && registration.subscriber) {
      return registration.participant.location === registration.subscriber.location;
    }
    return true;
  }

  async fix(registration) {
    console.log(`Update ${registration.email} junction location from ${registration.participant.location} to ${registration.subscriber.location}`);
    return false;
  }

}

class JunctionRemoveAllTags extends RegistrationTest {

  async test(registration) {
    if (registration.participant) {
      return false;
    }
    return true;
  }

  async fix(registration) {
    return await this.services.junction.updateparticipant(registration.participant, { tags: [] });
  }

}

class JunctionWrongLocationTags extends RegistrationTest {

  async init() {
    this.locationtags = [...this.services.cassini.getnames(), "No location"]
  }

  async test(registration) {
    if (registration.participant && registration.participant.isactive) {
      let positivetags = [registration.participant.location ? this.services.cassini.gethackathonname(registration.participant.location) : "No location"];
      let negativetags = [this.locationtags.filter((tag) => !positivetags.includes(tag))];
      return positivetags.every((tag) => registration.participant.tags.includes(tag))
        && negativetags.every((tag) => !registration.participant.tags.includes(tag));
    }
    return true;
  }

  async fix(registration) {
    let othertags = registration.participant.tags.filter((tag) => !this.locationtags.includes(tag));
    let locationtag = registration.participant.location ? this.services.cassini.gethackathonname(registration.participant.location) : "No location";
    return await this.services.junction.updateparticipant(registration.participant, { tags: [...othertags, locationtag] });
  }

}

class JunctionWrongTeamMemberTags extends RegistrationTest {

  async init() {
    let coreteammembergroup = await this.services.mailerlite.getgroupbyname("Core Team Members");
    let coreteammembers = await this.services.mailerlite.getsubscribersingroup(coreteammembergroup.id, null);
    this.coreteammemberids = coreteammembers.map((subscriber) => subscriber.id);
    let localorganisergroup = await this.services.mailerlite.getgroupbyname("Local Organisers June 2021");
    let localorganisers = await this.services.mailerlite.getsubscribersingroup(localorganisergroup.id, null);
    this.localorganiserids = localorganisers.map((subscriber) => subscriber.id);
    this.coreteammembertag = "Core Team Member";
    this.localorganisertag = "Local Organiser";
  }

  async test(registration) {
    if (registration.participant) {
      if (registration.subscriber) {
        this.cache.iscoreteammember = this.coreteammemberids.includes(registration.subscriber.id);
        this.cache.islocalorganiser = this.localorganiserids.includes(registration.subscriber.id);
      } else {
        this.cache.iscoreteammember = false;
        this.cache.islocalorganiser = false;
      }
      let hascoreteammembertag = registration.participant.tags.includes(this.coreteammembertag);
      let haslocalorganisertag = registration.participant.tags.includes(this.localorganisertag);
      return (this.cache.iscoreteammember === hascoreteammembertag) && (this.cache.islocalorganiser === haslocalorganisertag);
    }
    return true;
  }

  async fix(registration) {
    let tags = registration.participant.tags.filter((tag) => (tag !== this.coreteammembertag) && (tag !== this.localorganisertag));
    tags = this.cache.iscoreteammember ? [...tags, this.coreteammembertag] : tags;
    tags = this.cache.islocalorganiser ? [...tags, this.localorganisertag] : tags;
    return await this.services.junction.updateparticipant(registration.participant, { tags });
  }

}

class JunctionWrongEligibilityTags extends RegistrationTest {

  async init() {
    this.eligibletag = "Eligible";
    this.noteligibletag = "Not eligible";
  }

  async test(registration) {
    if (registration.participant) {
      let iseligible = registration.participant.checkeligibity();
      let haseligibletag = registration.participant.tags.includes(this.eligibletag);
      let hasnoteligibletag = registration.participant.tags.includes(this.noteligibletag);
      this.cache.iseligible = iseligible;
      return (iseligible === haseligibletag) && (iseligible !== hasnoteligibletag);
    }
    return true;
  }

  async fix(registration) {
    let othertags = registration.participant.tags.filter((tag) => (tag !== this.eligibletag) && (tag !== this.noteligibletag));
    let tags = this.cache.iseligible ? [...othertags, this.eligibletag] : [...othertags, this.noteligibletag];
    return await this.services.junction.updateparticipant(registration.participant, { tags });
  }

}

module.exports = {
  JunctionButNotOnWebsite,
  JunctionOnWebsiteButUnconfirmed,
  JunctionOnWebsiteButUnsubscribed,
  JunctionOnWebsiteButNotConsented,
  JunctionCheckedInButNoLocation,
  JunctionDifferentLocationAsOnWebsite,
  JunctionRemoveAllTags,
  JunctionWrongLocationTags,
  JunctionWrongTeamMemberTags,
  JunctionWrongEligibilityTags
}
