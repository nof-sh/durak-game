const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const Game = require('./initGame.js');
const WebSocket = require('ws');

app.use(express.json()); // for parsing application/json

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Firestore
const db = admin.firestore();


app.post('/createGameRoom', async (req, res) => {
    // Generate a random 8-digit room number
    const roomNumber = Math.floor(10000000 + Math.random() * 90000000);
    // Create a new room document in Firestore with the generated room number
    const docRef = db.collection('gameRooms').doc(roomNumber.toString());
    // Add the player who created the room to the players array
    const room = {
      players: [req.body.playerId], // Add the player who created the room
      gameState: 'waiting' // Set the initial game state
    };
    // Save the room document to Firestore and send the room number to the client
    docRef.set(
      room
    )
    .then(() => {
      res.json({ roomId: docRef.id }); // send the room id to the client in JSON format.
    })
    .catch((error) => {
      console.error('Error adding document: ', error); // log the error to the console.
      res.status(500).send({ error: 'Error adding document \n' }); // send an error response to the client.
    });
});

// delete a room from the database.
app.delete('/deleteGameRooms/:roomId', async (req, res) => {
  const roomId = req.params.roomId;

  console.log('Deleting room with ID: ', roomId); // Log the roomId

  try {
    await db.collection('gameRooms').doc(roomId).delete();
    res.status(200).send(`Room ${roomId} deleted`);
  } catch (error) {
    console.error('Error deleting room: ', error);
    res.status(500).send('Error deleting room');
  }
});

// Your other routes and app.listen call here

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

app.post('/leaveGameRoom', async (req, res) => {
    const roomId = req.body.roomId; // the room id to leave.
    const playerId = req.body.playerId; // the player id to remove from the room.
  
    const roomRef = db.collection('gameRooms').doc(roomId); // point to the room document.
    const roomSnapshot = await roomRef.get(); // the room document itself.
    
    if (!roomSnapshot.exists) { // if the room does not exist.
      res.status(404).send({ error: 'Room not found \n ' });
      console.log("The room does not exist. \n ");
      return;
    }
    const roomData = roomSnapshot.data(); // the room data.
    // remove the player from the room.
    await roomRef.update({ 
        players: admin.firestore.FieldValue.arrayRemove(playerId) // remove player from the players array.
    });
    res.send({ message: 'Successfully left room \n' });
    console.log(`Player ${playerId} has left the room.\n`);
});

app.post('/playCard', (req, res) => {
  try {
      let player = req.body.player;
      let card = req.body.card;
      let playCard = Game.playCard(player, card);
      if (playCard === true){
        res.status(200).send('Card played successfully');
      }else{
        res.status(400).send('it is not your turn or the move is not legal.');
      }     
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

const port = 3000;
app.listen(port, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});