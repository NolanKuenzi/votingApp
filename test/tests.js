const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool(process.env.DB);

chai.use(chaiHttp);

describe('tests', function() {
  this.timeout(10000);
  // cleanup
  after(() => {
    pool.query(`DELETE FROM usrs WHERE Email='mr.nolank@gmail.com'`);
    pool.query('DROP TABLE polls');
  })
  // Authorization testing variable 
  let authorization;
  // Poll Id testing variables
  let ID0;
  let ID1;
  describe('Register tests', function() {
    it('A user can be registered', function() {
      return chai.request(server)
      .post('/api/register')
      .send({
        email: 'mr.nolank@gmail.com',
        password: 'password0',
      })
      .then(res => {
        assert.equal(res.status, 200);
      })
    })
    it('Duplicate email registered', function() {
      return chai.request(server)
      .post('/api/register')
      .send({
        email: 'mr.nolank@gmail.com',
        password: 'password0'
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Email already exists');
      })
    })
    it('Email length exceeded', function() {
      return chai.request(server)
      .post('/api/register')
      .send({
        email: 'ttttttttteeeeeeeeessssssssssttttttttttttUUUUUUUUUssssssssssssseeeeeeeeeeeeeeerrrrrrrrrrrrrrr@yahoo.com',
        password: 'password0'
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Email length of 100 characters has been exceeded');
      })
    })
    it('Password length exceeded', function() {
      return chai.request(server)
      .post('/api/register')
      .send({
        email: 'mr.nolank@gmail.com',
        password: 'ppppppppaaaaaaaaasssssssssswwwwwwwwwooooooooorrrrrrrrrddddddddd'
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Password length of 60 characters has been exceeded');
      })
    })
  })
  describe('Login tests', function() {
    it('a user can be logged in', function() {
      return chai.request(server)
      .post('/api/login')
      .send({
        email: 'mr.nolank@gmail.com',
        password: 'password0',
      })
      .then(res => {
        authorization = res.body;
        assert.equal(res.status, 200);
      })    
    })
    it('Email not found', function() {
      return chai.request(server)
      .post('/api/login')
      .send({
        email: 'wrongEmail@yahoo.com',
        password: 'password0',
      })
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Email not found');
      })    
    })
    it('Password does not match email', function() {
      return chai.request(server)
      .post('/api/login')
      .send({
          email: 'mr.nolank@gmail.com',
          password: 'password00',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Password does not match email');
      })    
    })
  })
  describe('Reset tests', function() {
    it('Email not found', function() {
      return chai.request(server)
      .put('/api/reset')
      .send({
          email: 'not-a-testUser@yahoo.com',
      })
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Email not found');
      })    
    }) 
    it('Reset email is sent to user', function() {
      return chai.request(server)
      .put('/api/reset')
      .send({
          email: 'mr.nolank@gmail.com',
      })
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.msg, 'success');
      })    
    })
    // reset tests - /polls? (with reset query)
    it('Invalid reset query', function() {
      return chai.request(server)
      .get('/polls?resetPasword=mr.nolank@gmail.com')
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Invalid query');
      })    
    })
    it('Invalid reset email', function() {
      return chai.request(server)
      .get('/polls?resetPass=mr.polank@gmail.com')
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Email not found');
      })    
    })
    // reset tests - newPass
    it('Email not found', function() {
      return chai.request(server)
      .put('/api/newPass')
      .send({
          email: 'not-a-testUser@yahoo.com',
          resetCode: undefined,
          newPassword: 'password1'
      })
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Email not found');
      })    
    })
    it('Password length exceeded', function() {
      return chai.request(server)
      .put('/api/newPass')
      .send({
        email: 'mr.nolank@gmail.com',
        resetCode: undefined,
        newPassword: 'ppppppppaaaaaaaaasssssssssswwwwwwwwwooooooooorrrrrrrrrddddddddd'
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'New password length of 60 characters has been exceeded');
      })
    })
    it('Invalid Reset Code', function() {
      return chai.request(server)
      .put('/api/newPass')
      .send({
        email: 'mr.nolank@gmail.com',
        resetCode: '3ke94f20mfsi5b8',
        newPassword: 'password1'
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Invalid Reset Code');
      })
    })
  })
  describe('Check Token tests', function() {
    it('Token exists', function() {
      return chai.request(server)
      .get('/api/checkToken')
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 200);
      })
    })
    it('Token does not exist', function() {
      return chai.request(server)
      .get('/api/checkToken')
      .set('Cookie', `token=''`)
      .then(res => {
        assert.equal(res.status, 401);
        assert.equal(res.body.error, 'Unauthorized: Invalid Credentials, Please try again');
      })
    })
  })
  describe('AddPoll & GetPoll tests', function() {
    it('pollName length exceeded', function() {
      return chai.request(server)
      .post('/api/newPoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'Mierzyn is a village in the administrative district of Gmina Gryfice, within Gryfice County, West Pomeranian Voivodeship',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry0;testEntry1',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Poll name limit of 100 characters has been exceeded')
      })
    })
    it('entries length exceeded', function() {
      return chai.request(server)
      .post('/api/newPoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName0',
        user: 'mr.nolank@gmail.com',
        entries: `Williams Sonoma is an American retailer of cookware, 
        appliances and home furnishings. It is owned by Williams-Sonoma, 
        Inc. and was founded by Charles E. ;(Chuck) Williams in 1956.In 
        1947, Charles E. (Chuck) Williams settled in Sonoma, California, 
        and opened his first shop as a hardware store. ;In 1953, Williams 
        took his first trip to France. He quickly fell in love with French 
        kitchenware such as copper cookware, and is quoted as saying, "I knew 
        this was something that wasn’t found in America, but thought people would 
        want.";[2] Shortly after returning home, he formulated a plan to import French 
        cooking and serving equipment into America and converted his store into a cookware 
        shop in 1956. ;Williams Sonoma was founded, selling professional and restaurant-quality kitchenware for home use...`
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Poll entries limit has exceeded the maximum size allowed')
      })
    })
    it ('Poll contains less than two entries', function() {
      return chai.request(server)
      .post('/api/newpoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName0',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry0;',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Polls must contain at least two entries');
      })
    })
    it('Length of a single entry exceeded', function() {
      return chai.request(server)
      .post('/api/newpoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName0',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry0;testEntry1;testEntry222222222222222222222222222222222222222222',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Entry limit of 50 characters has been exceeded');
      })
    })
    it('Duplicate entries', function() {
      return chai.request(server)
      .post('/api/newPoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName0',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry0;testEntry1;testEntry1',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Cannot Create Duplicate Poll Entires')
      })
    })
    // before polls table is created
    it('Empty Poll Data array is returned when polls table has not yet been created', function() {
      return chai.request(server)
      .get('/api/getPolls')
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.data.length, 0);
      })
    })
    // after polls table is created
    it('Poll is added', function() {
      return chai.request(server)
      .post('/api/newPoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName0',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry0;;testEntry1;testEntry2;;',
      })
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.msg, 'Success')
      })
    })
    it('Duplicate poll name', function() {
      return chai.request(server)
      .post('/api/newPoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName0',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry0;testEntry1;testEntry2',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Poll Name Already Exists')
      })
    })
    it('Second poll is added', function() {
      return chai.request(server)
      .post('/api/newPoll')
      .set('Cookie', `token=${authorization}`)
      .send({
        pollName: 'testPollName1',
        user: 'mr.nolank@gmail.com',
        entries: 'testEntry3;testEntry4;testEntry5',
      })
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.msg, 'Success')
      })
    })
    let testPoll0Id;
    it('Poll Data is returned when the polls table has been created', function() {
      return chai.request(server)
      .get('/api/getPolls')
      .then(res => {
        assert.equal(res.body.data[0].Name, 'testPollName0');
        assert.equal(res.body.data[1].Name, 'testPollName1');
        assert.equal(res.status, 200);
        testPoll0Id = res.body.data[0]._id;
      })
    })
    // check poll id
    it('Poll has a valid id', function() {
      return chai.request(server)
      .get(`/api/${testPoll0Id}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.msg, 'Success');
      })
    })
    it('Poll does not have a valid id', function() {
      return chai.request(server)
      .get('/api/47ghboksu8djf')
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Poll not found');
      })
    })
    // get a poll by its id
    it('Invalid id', function() {
      return chai.request(server)
      .get('/api/polls/ei492ldjg3j36')
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Poll not found');
      })
    })
    it('Poll data is returned', function() {
      return chai.request(server)
      .get(`/api/polls/${testPoll0Id}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.data[0].Name, 'testPollName0');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[0].name, 'testEntry0');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[1].name, 'testEntry1');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[2].name, 'testEntry2');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[0].count, 0);
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[1].count, 0);
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[2].count, 0);
      })
    })
  })
  describe('Handle vote tests', function() {
    it('Poll entry not found', function() {
      return chai.request(server)
      .put('/api/handleVote')
      .send({
        name: 'testPollName0',
        item: 'testEnryErr',
      })
      .then(res => {
        assert.equal(res.status, 404);
        assert.equal(res.body.error, 'Poll entry not found');
      })
    })
    it('A poll entry can be voted for', function() {
      return chai.request(server)
      .put('/api/handleVote')
      .send({
        name: 'testPollName0',
        item: 'testEntry1',
      })
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.data[0].Name, 'testPollName0');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[0].name, 'testEntry0');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[1].name, 'testEntry1');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[2].name, 'testEntry2');
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[0].count, 0);
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[1].count, 1);
        assert.equal(JSON.parse(res.body.data[0].PollInfo)[2].count, 0);
      })
    })
    it('Multiple votes from the same ip address results in an error', function() {
      return chai.request(server)
      .put('/api/handleVote')
      .send({
        name: 'testPollName0',
        item: 'testEntry1',
      })
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Only one vote per poll is allowed');
      })
    })
  })
  describe('Edit & Delete a single poll - tests', function() {
    it(`A user's polls can be fetched`, function() {
      return chai.request(server)
      .get('/api/userPolls/mr.nolank@gmail.com')
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.data[0].Name, 'testPollName0');
        assert.equal(res.body.data[1].Name, 'testPollName1');
        ID0 = res.body.data[0]._id;
        ID1 = res.body.data[1]._id;
      })
    })
    it('A single poll can be fetched to be edited', function() {
      return chai.request(server)
      .get(`/api/userPolls/edit/${ID0}`)
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.data[0], 'testEntry0');
        assert.equal(res.body.data[1], 'testEntry1');
        assert.equal(res.body.data[2], 'testEntry2');
      })
    })
    it('A single poll can be deleted', function() {
      return chai.request(server)
      .delete(`/api/userPolls/delete/${ID0}`)
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.notEqual(res.body.data[0].Name, 'testPollName0')
        assert.equal(res.body.data[0].Name, 'testPollName1')
      })
    })
  })
  describe(`Add and delete entries from a single poll`, function() {
    it('A poll entry can be deleted', function() {
      return chai.request(server)
      .put(`/api/userPolls/deleteEntry/mr.nolank@gmail.com/${ID1}/testEntry3`)
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.notEqual(res.body.data[0], 'testEntry3');
        assert.equal(res.body.data[0], 'testEntry4');
        assert.equal(res.body.data[1], 'testEntry5');
      })
    })
    it('A poll entry cannot be deleted if the poll contains less than three entires', function() {
      return chai.request(server)
      .put(`/api/userPolls/deleteEntry/mr.nolank@gmail.com/${ID1}/testEntry4`)
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Poll must contain at least two entries');
      })
    })
    it('A poll entry over 50 characters in length cannot be added', function() {
      return chai.request(server)
      .put(`/api/userPolls/addEntry/mr.nolank@gmail.com/${ID1}/ttttteeeeeesssstttttEEEEEnnnnntttttrrrrryyyyy666666`)
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'Entry limit of 50 characters has been exceeded');
      })
    })
    it('A poll entry can be added', function() {
      return chai.request(server)
      .put(`/api/userPolls/addEntry/mr.nolank@gmail.com/${ID1}/testEntry6`)
      .set('Cookie', `token=${authorization}`)
      .then(res => {
        assert.equal(res.status, 200);
        assert.equal(res.body.data[0], 'testEntry4');
        assert.equal(res.body.data[1], 'testEntry5');
        assert.equal(res.body.data[2], 'testEntry6');
      })
    })
  })
})