let chai = require('chai');
let expect = require("chai").expect;
const app = require('../app')
var http = require('http')
var request = require('supertest');
const server_url = 'https://sdm-g6.herokuapp.com/'
var process_messageText =  require('../controllers/admincontroller').process_messageText;

describe('unit_open_configurationPage_for_admin', function () {
  describe('#process_configuration_messageText()', function () {
      it('should return the result of message', function () {
          var message={"text":"conf"}
          var isConf = false;
          let texts = ['conf','Conf','configuration','Configuration'];
          isConf=process_messageText(isConf,texts,message);
          console.log(isConf)
          expect(isConf).to.be.ok;
      });
  });
  describe('#process_event_messageText()', function () {
    it('should return the result of event', function () {
        var message={"text":"event"}
        var isEvent = false;
        let texts = ['event','Event','eventlog','Eventlog']
        isEvent=process_messageText(isEvent,texts,message);
        console.log(isEvent)
        expect(isEvent).to.be.ok;
    });
});
});


// "test": "./node_modules/mocha/bin/mocha ./tests/test.js"
/** 
describe('#Manager and Researcher list the survey cereated by current people.',function(){
    request = request(server_url);
    it('#Manager should list all survey that come from current manager', function(done) {
        request
        .post('/slashcommand/survey/list')
        .set("Connection", "keep alive")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .type("form")
        .send({"user_name":"ioswpf","text":"researcher","user_id":"UCSLXUNRG"})
        .expect(200)
        .end(function(err, res) {
          if (err) done(err);
          res.body.should.have.property('text');
          res.body.participant.should.have.property('8', 'test8');
           });
        done();
    });
  });

*/
module.exports = { server_url }