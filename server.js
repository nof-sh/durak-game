const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./Users/nofshabtay/projects/durak game/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

let docRef = db.collection('gameRooms').doc('room1');
let setDoc = docRef.set({
  players: ['player1', 'player2'],
  gameState: 'waiting'
});

app.post('/createGameRoom', async (req, res) => {
    const room = {
      players: [req.body.playerId], // Add the player who created the room
      gameState: 'waiting' // Set the initial game state
    };
  
    const docRef = await db.collection('gameRooms').add(room);
    res.send({ roomId: docRef.id });
  });

  app.post('/joinGameRoom', async (req, res) => {
    const roomId = req.body.roomId;
    const playerId = req.body.playerId;
  
    const roomRef = db.collection('gameRooms').doc(roomId);
    const room = await roomRef.get();
  
    if (!room.exists) {
      res.status(404).send({ error: 'Room not found' });
      return;
    }
  
    await roomRef.update({
      players: admin.firestore.FieldValue.arrayUnion(playerId)
    });
  
    res.send({ message: 'Successfully joined room' });
  });


















const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));