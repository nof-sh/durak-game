const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const Game = require('./initGame.js');
const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(app);

app.use(express.json()); // for parsing application/json

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.post('/createGameRoom', async (req, res) => {
    const room = {
      players: [req.body.playerId], // Add the player who created the room
      gameState: 'waiting' // Set the initial game state
    };
  
    const docRef = await db.collection('gameRooms').add(room); // Add the room to the collection.
    res.send({ roomId: docRef.id }); // send the room id to the client.
});

app.post('/joinGameRoom', async (req, res) => {
    const roomId = req.body.roomId; // the room id to join.
    const playerId = req.body.playerId; // the player id to add to the room.
  
    const roomRef = db.collection('gameRooms').doc(roomId); // point to the room document.
    const roomSnapshot = await roomRef.get(); // the room document itself.
    
    if (!roomSnapshot.exists) { // if the room does not exist.
      res.status(404).send({ error: 'Room not found \n ' });
      console.log("The room does not exist. \n ");
      return;
    }
    const roomData = roomSnapshot.data(); // the room data.
    // check if the room is full.
    if (roomData.players.lenght >= 4){
        res.status(400).send({ error: 'Room is full \n'});
        console.log("The room is full. Cannot add more players. \n")
        return;
    } else{
        // add the player to the room.
        await roomRef.update({ 
            players: admin.firestore.FieldValue.arrayUnion(playerId) // add player to the players array.
        });
        res.send({ message: 'Successfully joined room \n' });
        console.log(`Player ${playerId} has joined the room.\n`);

    }
});

app.post('/playCard', (req, res) => {
  try {
      let player = req.body.player;
      let card = req.body.card;
      Game.playCard(player, card);
      res.status(200).send('Card played successfully');
  } catch (error) {
      res.status(400).send(error.message);
  }
});

app.post('/takeCardsFromTable', (req, res) => {
  try {
      let player =  req.body.player;
      let card = req.body.card;
      Game.takeCardsFromTable(player);
      res.status(200).send('Cards from Table added successfully');
  } catch (error) {
      res.status(400).send(error.message);
  }
});

app.post('/endTurn', async (req, res) => {
  try {
    let players = req.body.players;
    let pot = req.body.pot;
    let trumpCard = req.body.trumpCard;

    // Update the variables of the current game
    // ...

    // Update the Firestore document with the updated game state
    let roomId = req.body.roomId;
    let roomRef = db.collection('gameRooms').doc(roomId);
    await roomRef.update({
      players: players,
      pot: pot,
      trumpCard: trumpCard
    });

    res.status(200).send('Turn ended successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/startGame', async (req, res) => {
  let roomId = req.body.roomId;

  // Retrieve the room from Firestore
  let roomRef = db.collection('gameRooms').doc(roomId);
  let roomDoc = await roomRef.get();

  if (!roomDoc.exists) {
      res.status(400).send('Cannot start game: Room does not exist');
      return;
  }

  let roomData = roomDoc.data();

  // Check if the room has players
  if (roomData.players && roomData.players.length > 0) {
      // Initialize a new game with the players in the room
      let game = new Game(roomData.players);
      // Convert the game object to a plain JavaScript object (for saving to Firestore).
      let gameObject = game.toObject();

      // Store the game instance in roomData
      roomData.game = gameObject;

      // Set the game state to "started"
      roomData.gameState = 'started';

      // Save the game state back to Firestore
      await roomRef.update(roomData);

      // Notify all players in the room that the game has started
      io.to(roomId).emit('gameStarted');

      res.status(200).send('Game started successfully');
  } else {
      res.status(400).send('Cannot start game: Room has no players');
  }
});

app.get('/', (req, res) => {
  res.status(200).send('DURAK Multiplayer Game Server. The server is running and listening for requests.');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});