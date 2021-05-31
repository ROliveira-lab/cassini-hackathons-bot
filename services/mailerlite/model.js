class Subscriber {

  constructor(subscriber) {
    this.subscriber = subscriber;
  }

  get id() {
    return this.subscriber.id;
  }

  get created() {
    return this.subscriber.date_created;
  }

  get updated() {
    return this.subscriber.date_updated;
  }

  get firstname() {
    return this.subscriber.fields.find((field) => field.key === "name")?.value;
  }

  get lastname() {
    return this.subscriber.fields.find((field) => field.key === "last_name")?.value;
  }

  get email() {
    return this.subscriber.email;
  }

  get countryofip() {
    return getcountry(this.subscriber.country_id);
  }

  get location() {
    return this.subscriber.fields.find((field) => field.key === "hackathon_location")?.value;
  }

  get status() {
    return this.subscriber.type;
  }

  get isactive() {
    return this.subscriber.type === "active";
  }

  get consent() {
    return this.subscriber.fields.find((field) => field.key === "marketing_permissions")?.value;
  }

  get isconsented() {
    return this.consent ? this.consent.includes("my participation in the hackathon") : false;
  }

  export() {
    return {
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      countryofip: this.countryofip,
      location: this.location,
      status: this.status,
      consent: this.consent
    }
  }
}

function getcountries() {
  return require("./countries.json");
}

function getcountry(id) {
  return getcountries().find(country => parseInt(country.id) === id)?.name;
}

module.exports = { Subscriber }
