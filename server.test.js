// server.test.js

const request = require('supertest');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const http = require('http');
const app = require('./server');

let server;
let io;
let clientSocket;

beforeAll((done) => {
  server = http.createServer(app);
  io = new Server(server);
  server.listen(() => {
    const port = server.address().port;
    clientSocket = new Client(`http://localhost:${port}`);
    clientSocket.on('connect', done);
  });
});

afterAll(() => {
  io.close();
  clientSocket.close();
});

it('should set playerName when "playerName" event is emitted', (done) => {
  clientSocket.emit('playerName', 'John Doe');
  io.on('connection', (socket) => {
    expect(socket.playerName).toBe('John Doe');
    done();
  });
});