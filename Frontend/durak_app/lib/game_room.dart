// This file contains the create game room screen and the joined game room screen
import 'package:durak_app/play_game_screen.dart';
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
            Text('Game Room # $roomId # created successfully'),
            ElevatedButton(
              child: const Text('Start Game'),
              onPressed: () {
                // Emit 'startGame' event to the server
                socket.emit('startGame', roomId);
                socket.on('gameStartedNotification', (data) {
                  // When the server responds, start the game
                  _log.info('Game started');
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => PlayGameScreen(data, playerName, roomId, socket)),
                  );
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



class JoinedGameRoomScreen extends StatefulWidget {
  final String roomId;
  final String playerName;
  final int numberOfUsersInRoom;
  final io.Socket socket;

  const JoinedGameRoomScreen(this.playerName, this.roomId, this.numberOfUsersInRoom, this.socket, {super.key});
  
  @override
  State<JoinedGameRoomScreen> createState() => _JoinedGameRoomScreenState();
}

class _JoinedGameRoomScreenState extends State<JoinedGameRoomScreen> {
  int numberOfUsers = 0;

  @override
  void initState() {
    super.initState();
    numberOfUsers = widget.numberOfUsersInRoom + 1;
    widget.socket.on('joinedRoom', (data) {
      setState(() {
        numberOfUsers = data['numberOfPlayers'];
      });
    });
    widget.socket.on('playerJoined', (data) {
      setState(() {
        numberOfUsers = data['numberOfPlayers'];
      });
    });
    widget.socket.on('gameStartedNotification', (data) {
      // When the server responds, start the game
      _log.info('Game started');
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => PlayGameScreen(data, widget.playerName, widget.roomId, widget.socket)),
      );
    });
    widget.socket.on('roomDeletedNotification', (data) {
      // Navigate to the main menu
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Game Room Deleted'),
            content: const Text('The game room has been deleted.'),
            actions: [
              ElevatedButton(
                child: const Text('OK'),
                onPressed: () {
                  Navigator.pop(context);
                },      
              ),
            ],
          );
        },
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Game Room ${widget.roomId}'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'You joined game room ${widget.roomId}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Text(
              'In The Room $numberOfUsers users including you.',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              'The game will start soon. Please wait...',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
      ),
    );
  }
}