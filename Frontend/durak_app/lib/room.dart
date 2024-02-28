// This file contains the logic for the room dialog that is displayed when the user clicks on a room in the lobby.
// ignore_for_file: use_build_context_synchronously

import 'package:durak_app/api.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class RoomModel extends ChangeNotifier {
  String roomNumber;
  int userCount;

  RoomModel(this.roomNumber, this.userCount);

  void addUser() {
    userCount++;
    notifyListeners();
  }

  void startGame() {
    // Add your start game logic here
  }

 
}

void showRoomDialog(BuildContext context, String roomNumber, int userCount) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return ChangeNotifierProvider(
        create: (context) => RoomModel(roomNumber, userCount),
        child: RoomDialog(roomNumber, userCount),
      );
    },
  );
}

 void exit(roomNumber) async {
    await deleteGameRoom(roomNumber);
 }

class RoomDialog extends StatelessWidget {
  final String roomNumber;
  final int userCount;

  const RoomDialog(this.roomNumber, this.userCount, {super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Room $roomNumber'),
      content: Text('Number of users in the room: $userCount'),
      actions: <Widget>[
        TextButton(
          child: const Text('Start Game'),
          onPressed: () {
            Provider.of<RoomModel>(context, listen: false).startGame();
          },
        ),
        TextButton(
          child: const Text('Exit'),
          onPressed: () {
            exit(roomNumber);
            Navigator.of(context).pop();
          },
        ),
      ],
    );
  }
}

void showJoinRoomDialog(BuildContext context) {
  final TextEditingController controller = TextEditingController();

  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text('Join Room'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: "Enter Room Number"),
        ),
        actions: <Widget>[
          TextButton(
            child: const Text('OK'),
            onPressed: () async {
              String roomId = controller.text;
              try {
                String roomNumber = await joinGameRoom(roomId);
                joinedGameRoomDialog(context, roomNumber);
              } catch (e) {
                showDialog (
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: const Text('Error'),
                      content: Text('Failed to join room - $e'),
                      actions: <Widget>[
                        TextButton(
                          child: const Text('OK'),
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                        ),
                      ],
                    );
                  },
                );   
              }
            },
          ),
        ],
      );
    },
  );
}

void joinedGameRoomDialog(BuildContext context, String roomNumber) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: const Text('Joined Room'),
        content: Text('You have joined room $roomNumber the game will start soon...please wait!'),
        actions: <Widget>[
          TextButton(
            child: const Text('I want to leave the room'),
            onPressed: () {
              // Implement exit room functionality
              leaveGameRoom(roomNumber);
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );
}

