const moment = require('moment');

function count(array, predicate) {
  return predicate ? array.reduce((n, item) => predicate(item) ? n + 1 : n, 0) : array.length;
}

class RegistrationsReport {

  constructor(registrations) {
    this.registrations = registrations;
  }

  total() {
    return count(this.registrations);
  }

  websitetotal() {
    return count(this.registrations, (r) => r.subscriber)
  }

  websitesince(amount, unit) {
    let startdate = moment().subtract(amount, unit);
    return count(this.registrations, (r) => r.subscriber && moment(r.subscriber.created).isAfter(startdate));
  }

  websiteactive() {
    return count(this.registrations, (r) => r.subscriber && r.subscriber.isconsented && r.subscriber.isactive);
  }
  
  websiteunconfirmed() {
    return count(this.registrations, (r) => r.subscriber && r.subscriber.isconsented && r.subscriber.isunconfirmed);
  }
  
  websitenoconsent() {
    return count(this.registrations, (r) => r.subscriber && !r.subscriber.isconsented);
  }

  junctiontotal() {
    return count(this.registrations, (r) => r.participant);
  }

  junctionsince(amount, unit) {
    let startdate = moment().subtract(amount, unit);
    return count(this.registrations, (r) => r.participant && moment(r.participant.created).isAfter(startdate));
  }
 
  junctionfromwebsite() {
    return count(this.registrations, (r) => r.subscriber && r.participant);
  }
  
  junctionadditional() {
    return count(this.registrations, (r) => !r.subscriber && r.participant);
  }

  eventtiatotal() {
    return count(this.registrations, (r) => r.attendee);
  }
    
  eventtiasince(amount, unit) {
    let startdate = moment().subtract(amount, unit);
    return count(this.registrations, (r) => r.attendee && moment(r.attendee.created).isAfter(startdate));
  }

  eventtiafromwebsite() {
    return count(this.registrations, (r) => r.subscriber && r.attendee);
  }
  
  eventtiaadditional() {
    return count(this.registrations, (r) => !r.subscriber && r.attendee);
  }
}

module.exports = { RegistrationsReport }
