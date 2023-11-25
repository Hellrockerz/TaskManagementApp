const chai = require('chai');
const supertest = require('supertest');
const app = require('../../Task Management App/index'); 

const expect = chai.expect;
const request = supertest(app);

describe('API Endpoints', () => {
  let token; 

  describe('POST /api/signup', () => {
    it('should sign up a new user', async () => {
      const res = await request.post('/api/signup').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobileNo: '1234567890',
        password: 'password',
        cPassword: 'password',
      });

      if (res.body.message === 'User Already Exists') {
        expect(res.status).to.equal(201);
        expect(res.body.message).to.equal('User Already Exists');
      } else {
        // User is expected to be created successfully
        expect(res.status).to.equal(201);
        expect(res.body.message).to.equal('Signed Up Successfully');
        expect(res.body.data).to.have.property('_id');
        expect(res.body.data).to.have.property('username');
      }
    });
  });


  describe('POST /api/login', () => {
    it('should log in an existing user', async () => {
      const res = await request.post('/api/login').send({
        email: 'john.doe@example.com',
        password: 'password',
      });

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal('Logged in successfully');
      expect(res.body.token).to.exist;

      token = res.body.token;
    });
  });
});
