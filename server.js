const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('serviceAccountKey.json');
const game = require('initGame.js');

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


















const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));