const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { Game } = require('./initGame.js');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json()); // for parsing application/json

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Firestore
const db = admin.firestore();

app.use('/images', express.static(path.join(__dirname, 'images')));

let game;

io.on('connection', (socket) => {
  socket.on('playerName', (playerName) => {
    socket.playerName = playerName;
  });
  socket.on('createGameRoom', async (playerId) => {
    // Generate a random 8-digit room number
    const roomNumber = Math.floor(10000000 + Math.random() * 90000000);
    // Create a new room document in Firestore with the generated room number
    const docRef = db.collection('gameRooms').doc(roomNumber.toString());
    // Add the player who created the room to the players array
    const room = {
      players: [playerId], // Add the player who created the room
      gameState: 'waiting' // Set the initial game state
    };
    // Save the room document to Firestore and send the room number to the client
    docRef.set(room)
      .then(() => {
        socket.join(docRef.id); // Join the client to the room
        console.log('Room created by: ', playerId, '  with ID: ', docRef.id); // Log the room creation
        socket.emit('createGameRoom', { message: 'Room created successfully', roomId: docRef.id }); // send a success response to the client.
      })
      .catch((error) => {
        console.error('Error adding document: ', error); // log the error to the console.
        socket.emit('error', { error: 'Error creating room' }); // send an error response to the client.
      });
  });

    // Listen for 'joinGameRoom' event to join a player to a game room
  socket.on('joinGameRoom', async (data) => {
    const playerId = data.playerId;
    const roomId = data.roomId;
    const roomRef = db.collection('gameRooms').doc(roomId); // point to the room document.
    const roomSnapshot = await roomRef.get(); // the room document itself.
      
    if (!roomSnapshot.exists) { // if the room does not exist.
      console.log("The room does not exist. \n ");
      socket.emit('error', { error: 'Room not found' });
      return;
    }
    const roomData = roomSnapshot.data(); // the room data.
    // check if the room is full.
    if (roomData.players.length >= 4){
        console.log("The room is full. Cannot add more players. \n")
        socket.emit('error', { error: 'Room is full' });
        return;
    } else{
        // add the player to the room.
        await roomRef.update({ 
            players: admin.firestore.FieldValue.arrayUnion(playerId) // add player to the players array.
        });
        console.log(`Player ${playerId} has joined the room.\n`);
        socket.join(roomId); // Join the client to the room
        socket.emit('joinedRoom', { numberOfPlayers: roomData.players.length });
        // Notify all clients in the room that a new player has joined
        io.to(roomId).emit('playerJoined', { playerId: playerId, numberOfPlayers: roomData.players.length});
    }
  });

  // Listen for 'leaveGameRoom' event to remove a player from a game room
  socket.on('leaveGameRoom', async (playerId, roomId) => {
    const roomRef = db.collection('gameRooms').doc(roomId); // point to the room document.
    const roomSnapshot = await roomRef.get(); // the room document itself.
    
    if (!roomSnapshot.exists) { // if the room does not exist.
      console.log("The room does not exist. \n ");
      socket.emit('error', { error: 'Room not found' });
      return;
    }
    const roomData = roomSnapshot.data(); // the room data.
    // remove the player from the room.
    await roomRef.update({ 
        players: admin.firestore.FieldValue.arrayRemove(playerId) // remove player from the players array.
    });
    game.removePlayer(playerId);
    console.log(`Player ${playerId} has left the room.\n`);
    socket.leave(roomId); // Remove the client from the room
    socket.emit('leftRoom', { message: 'Successfully left room' });
    // Notify all clients in the room that a player has left
    io.to(roomId).emit('playerLeft', { playerId: playerId });
  });

  // Listen for 'deleteGameRoom' event to delete a game room
  socket.on('deleteGameRoom', async (roomId) => {
    console.log('Deleting room with ID: ', roomId); // Log the roomId

    try {
      await db.collection('gameRooms').doc(roomId).delete();
      console.log(`Room ${roomId} deleted`);
      socket.emit('roomDeleted', { message: `Room ${roomId} deleted` });
      // Notify all clients in the room that the room has been deleted
      io.to(roomId).emit('roomDeletedNotification', { message: `Room ${roomId} deleted` });
    } catch (error) {
      console.error('Error deleting room: ', error);
      socket.emit('error', { error: 'Error deleting room' });
    }
  });

  // Listen for 'playCard' event to play a card
  socket.on('playCard', async (data) => {
    try {
      let playCard = game.playCard(data['player'], data['card']);
      let winner = game.getWinner();
      if (playCard.status == 1 && winner == ""){
        console.log('Card played successfully');
        console.log('the game state is: ', game.toObject());
        //socket.emit('gameUpdate', { message: 'Card played successfully', gameState: game.toObject()});
        // Notify all clients in the room that a card has been played
        io.to(data['roomId']).emit('gameUpdate', { gameState: game.toObject() });
      }else if( playCard.status == 0 && winner == ""){
        console.log('It is not your turn or the move is not legal.');
        socket.emit('error', { error: playCard.message});
      }else if (winner != ""){
        console.log('The game has ended');
        socket.emit('gameUpdate', { message: 'We have a winner!', winner: winner, gameState: game.toObject()});
        // Notify all clients in the room that the game has ended
        socket.emit('gameEndedNotification', { message: 'The game has ended' });
      }     
    } catch (error) {
      console.error('Error playing card: ', error);
      socket.emit('error', { error: error.message });
    }
  });

  // Listen for 'takeCardsFromTable' event to take cards from table
  socket.on('takeCardsFromTable', async (data) => {
    try {
      let result = game.takeCardsFromTable(data['player']);
      if (result.status == 1){
        console.log('Cards from Table added successfully', game.toObject());
        // Notify all clients in the room that cards have been taken from the table
        io.to(data['roomId']).emit('gameUpdate', {message: 'Cards from Table added successfully', gameState: game.toObject() });
      }else{
        console.log(result.message);
        socket.emit('error', { message: result.message });
      }
    } catch (error) {
      console.error('Error taking cards from table: ', error);
      socket.emit('error', { error: error.message });
    }
  });

  // Listen for 'startGame' event to start a game
  socket.on('startGame', async (roomId) => {
    // Retrieve the room from Firestore
    let roomRef = db.collection('gameRooms').doc(roomId);
    let roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      console.log('Cannot start game: Room does not exist');
      socket.emit('error', { error: 'Cannot start game: Room does not exist' });
      return;
    }

    let roomData = roomDoc.data();

    // Check if the room has players
    if (roomData.players && roomData.players.length > 0) {
      // Initialize a new game with the players in the room
      let players = Array.from(roomData.players);
      game = new Game();
      game.startNewGame(players);
      // Convert the game object to a plain JavaScript object (for saving to Firestore).
      if (game) {
        let gameObject = game.toObject();
        // Store the game instance in roomData
        roomData.game = gameObject;

        // Set the game state to "started"
        roomData.gameState = 'started';

        // Save the game state back to Firestore
        await roomRef.update(roomData);

        console.log('Game started successfully');
        io.to(roomId).emit('gameStartedNotification', { message: 'Game started successfully', data: gameObject});
        console.log('notify all clients in the room that the game has started');

      } else {
        console.error('Game is undefined');
      }

    } else {
      console.log('Cannot start game: Room has no players');
      socket.emit('error', { error: 'Cannot start game: Room has no players' });
    }
  });

  // Listen for 'endTurn' event to end a turn
  socket.on('endTurn', async (roomId, players, pot, trumpCard) => {
    try {
      // Update the variables of the current game
      // ...

      // Update the Firestore document with the updated game state
      let roomRef = db.collection('gameRooms').doc(roomId);
      await roomRef.update({
        players: players,
        pot: pot,
        trumpCard: trumpCard
      });

      console.log('Turn ended successfully');
      socket.emit('gameUpdate', { message: 'Turn ended successfully' });
      // Notify all clients in the room that the turn has ended
      io.to(roomId).emit('turnEndedNotification', { message: 'Turn ended' });
    } catch (error) {
      console.error('Error ending turn: ', error);
      socket.emit('error', { error: error.message });
    }
  });
  
});




app.get('/', (req, res) => {
  res.status(200).send('DURAK Multiplayer Game Server. The server is running and listening for requests.');
});

const port = 3000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
  });
}

module.exports = app;