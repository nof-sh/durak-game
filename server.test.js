const io = require('socket.io-client');
const { Server } = require('socket.io');
const http = require('http');
const { Firestore } = require('@google-cloud/firestore');
jest.mock('@google-cloud/firestore');

let server;
let clientSocket;
let ioServer;
let firestore;

beforeAll((done) => {
  server = http.createServer();
  ioServer = new Server(server);
  server.listen(() => {
    const port = server.address().port;
    clientSocket = io.connect(`http://localhost:${port}`);
    done();
  });
});

afterAll(() => {
  ioServer.close();
  clientSocket.close();
  server.close();
});

beforeEach(() => {
  firestore = new Firestore();
  firestore.collection.mockReturnValue({
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
    get: jest.fn(),
    onSnapshot: jest.fn(),
  });
});

test('should create a new game room', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomData = {
    players: [playerId],
    gameState: 'waiting',
  };
  const docRef = firestore.collection('gameRooms').doc(roomId);
  docRef.set.mockResolvedValue();
  docRef.id = roomId;
  firestore.collection.mockReturnValue(docRef);

  clientSocket.emit('createGameRoom', playerId);

  clientSocket.on('createGameRoom', (data) => {
    expect(data).toEqual({ message: 'Room created successfully', roomId });
    done();
  });
});

test('should join a game room', (done) => {
  const roomId = '12345678';
  const playerId = 'player2';
  const roomData = {
    players: ['player1'],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('joinGameRoom', { playerId, roomId });

  clientSocket.on('joinGameRoom', (data) => {
    expect(data).toEqual({ message: 'Joined room successfully', roomId });
    done();
  });
});

test('should not join a game room if the room does not exist', (done) => {
  const roomId = '12345678';
  const playerId = 'player2';
  const roomSnapshot = {
    exists: false,
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('joinGameRoom', { playerId, roomId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room not found' });
    done();
  });
});

test('should not join a game room if the room is full', (done) => {
  const roomId = '12345678';
  const playerId = 'player2';
  const roomData = {
    players: ['player1', 'player3', 'player4'],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('joinGameRoom', { playerId, roomId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room is full' });
    done();
  });
});

test('should leave a game room', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomData = {
    players: [playerId],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('leaveGameRoom', { playerId, roomId });

  clientSocket.on('leaveGameRoom', (data) => {
    expect(data).toEqual({ message: 'Left room successfully', roomId });
    done();
  });
});

test('should not leave a game room if the room does not exist', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomSnapshot = {
    exists: false,
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('leaveGameRoom', { playerId, roomId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room not found' });
    done();
  });
});

test('should start a game', (done) => {
  const roomId = '12345678';
  const roomData = {
    players: ['player1', 'player2'],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('startGame', roomId);

  clientSocket.on('startGame', (data) => {
    expect(data).toEqual({ message: 'Game started successfully', roomId });
    done();
  });
});

test('should not start a game if the room does not exist', (done) => {
  const roomId = '12345678';
  const roomSnapshot = {
    exists: false,
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('startGame', roomId);

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room not found' });
    done();
  });
});

test('should not start a game if the room is not full', (done) => {
  const roomId = '12345678';
  const roomData = {
    players: ['player1'],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('startGame', roomId);

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room is not full' });
    done();
  });
});

test('should end a turn', (done) => {
  const roomId = '12345678';
  const roomData = {
    players: ['player1', 'player2'],
    gameState: 'started',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('endTurn', roomId);

  clientSocket.on('endTurn', (data) => {
    expect(data).toEqual({ message: 'Turn ended successfully', roomId });
    done();
  });
});

test('should not end a turn if the room does not exist', (done) => {
  const roomId = '12345678';
  const roomSnapshot = {
    exists: false,
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('endTurn', roomId);

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room not found' });
    done();
  });
});

test('should not end a turn if the game is not started', (done) => {
  const roomId = '12345678';
  const roomData = {
    players: ['player1', 'player2'],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('endTurn', roomId);

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Game is not started' });
    done();
  });
});

test('should play a card', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const card = { suit: 'hearts', rank: 'A' };
  const roomData = {
    players: [
      { name: 'player1', hand: [card] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'started',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('playCard', { roomId, playerId, card });

  clientSocket.on('playCard', (data) => {
    expect(data).toEqual({ message: 'Card played successfully', roomId });
    done();
  });
});

test('should not play a card if the room does not exist', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const card = { suit: 'hearts', rank: 'A' };
  const roomSnapshot = {
    exists: false,
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('playCard', { roomId, playerId, card });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room not found' });
    done();
  });
});

test('should not play a card if the game is not started', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const card = { suit: 'hearts', rank: 'A' };
  const roomData = {
    players: [
      { name: 'player1', hand: [card] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'waiting',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('playCard', { roomId, playerId, card });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Game is not started' });
    done();
  });
});

test('should not play a card if it is not the player\'s turn', (done) => {
  const roomId = '12345678';
  const playerId = 'player2';
  const card = { suit: 'hearts', rank: 'A' };
  const roomData = {
    players: [
      { name: 'player1', hand: [card] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'started',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('playCard', { roomId, playerId, card });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'It is not your turn' });
    done();
  });
});

test('should not play a card if the move is not legal', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const card = { suit: 'hearts', rank: 'A' };
  const roomData = {
    players: [
      { name: 'player1', hand: [card] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'started',
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('playCard', { roomId, playerId, card });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Move is not legal' });
    done();
  });
});

test('should take cards from the table', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomData = {
    players: [
      { name: 'player1', hand: [] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'started',
    cardsOnTable: [{ suit: 'hearts', rank: 'A' }],
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('takeCards', { roomId, playerId });

  clientSocket.on('takeCards', (data) => {
    expect(data).toEqual({ message: 'Cards taken successfully', roomId });
    done();
  });
});

test('should not take cards from the table if the room does not exist', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomSnapshot = {
    exists: false,
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('takeCards', { roomId, playerId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Room not found' });
    done();
  });
});

test('should not take cards from the table if the game is not started', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomData = {
    players: [
      { name: 'player1', hand: [] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'waiting',
    cardsOnTable: [{ suit: 'hearts', rank: 'A' }],
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('takeCards', { roomId, playerId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Game is not started' });
    done();
  });
});

test('should not take cards from the table if the player is not a defender', (done) => {
  const roomId = '12345678';
  const playerId = 'player2';
  const roomData = {
    players: [
      { name: 'player1', hand: [] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'started',
    cardsOnTable: [{ suit: 'hearts', rank: 'A' }],
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('takeCards', { roomId, playerId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'You are not a defender' });
    done();
  });
});

test('should not take cards from the table if the move is not legal', (done) => {
  const roomId = '12345678';
  const playerId = 'player1';
  const roomData = {
    players: [
      { name: 'player1', hand: [] },
      { name: 'player2', hand: [] },
    ],
    gameState: 'started',
    cardsOnTable: [{ suit: 'hearts', rank: 'A' }],
  };
  const roomSnapshot = {
    exists: true,
    data: jest.fn().mockReturnValue(roomData),
  };
  const roomRef = firestore.collection('gameRooms').doc(roomId);
  roomRef.get.mockResolvedValue(roomSnapshot);
  firestore.collection.mockReturnValue(roomRef);

  clientSocket.emit('takeCards', { roomId, playerId });

  clientSocket.on('error', (data) => {
    expect(data).toEqual({ error: 'Move is not legal' });
    done();
  });
});
