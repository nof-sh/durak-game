import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:logging/logging.dart';

final Logger _log = Logger('GameRoom');

class GameRoom extends StatelessWidget {
  final String playerName;
  final String roomId;
  final io.Socket socket;

  const GameRoom(this.playerName, this.roomId, this.socket, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Game Room'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text('Game Room # $roomId # created by $playerName'),
            ElevatedButton(
              child: const Text('Start Game'),
              onPressed: () {
                // Emit 'startGame' event to the server
                socket.emit('startGame', roomId);
                socket.on('startGame', (data) {
                  // When the server responds, start the game
                  _log.info('Game started');
                });
              },
            ),
            ElevatedButton(
              child: const Text('Exit And Delete Game Room'),
              onPressed: () {
                // Emit 'deleteGameRoom' event to the server
                socket.emit('deleteGameRoom', roomId);
                socket.on('roomDeleted', (data) {
                  // When the server responds, return to the main menu
                  Navigator.pop(context);
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}