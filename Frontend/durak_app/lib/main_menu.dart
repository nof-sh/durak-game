import 'package:flutter/material.dart';
import 'package:durak_app/game_room.dart';
import 'package:durak_app/join_room.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class MainMenu extends StatelessWidget {
  final String playerName;
  final io.Socket socket;

  const MainMenu(this.playerName, this.socket, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Main Menu'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ElevatedButton(
              child: const Text('Create Game Room'),
              onPressed: () {
                // Emit 'createGameRoom' event to the server
                socket.emit('createGameRoom', playerName);
                socket.on('createGameRoom', (data) {
                  // When the server responds, navigate to the game room
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => GameRoom(playerName, data['roomId'].toString(), socket)),
                  );
                });
                socket.on('error', (data) {
                  if (data is Map && data.containsKey('error')) {
                    // Handle error
                    print('Error: ${data['error']}');
                  }
                });
              },
            ),
            ElevatedButton(
              child: const Text('Join Game Room'),
              onPressed: () {
                // join game room
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => JoinGameRoom(playerName, socket)),
                );
                

              },
            ),
            ElevatedButton(
              child: const Text('Exit'),
              onPressed: () {
                // return to the login screen
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}