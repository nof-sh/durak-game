import 'package:durak_app/game_room.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:logging/logging.dart';

final Logger _log = Logger('JoinGameRoom');

class JoinGameRoom extends StatelessWidget {
  final String playerName;
  final io.Socket socket;

  final TextEditingController _roomIdController = TextEditingController();

  JoinGameRoom(this.playerName, this.socket, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Join Game Room'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            TextField(
              controller: _roomIdController,
              decoration: const InputDecoration(
                hintText: 'Enter the Room Number',
              ),
            ),
            ElevatedButton(
              child: const Text('Join'),
              onPressed: () {
                // Emit 'joinGameRoom' event to the server
                String roomId = _roomIdController.text;
                socket.emit('joinGameRoom', (playerName, roomId));
                socket.on('joinedRoom', (data) {
                  // When the server responds, navigate to the game room
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => GameRoom(playerName, _roomIdController.text, socket)),
                  );
                });
                socket.on('error', (data) {
                  if (data is Map && data.containsKey('error')) {
                    // Handle error
                    _log.info('Error: ${data['error']}');
                  }
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
