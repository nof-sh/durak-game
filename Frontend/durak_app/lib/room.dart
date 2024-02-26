// This file contains the logic for the room dialog that is displayed when the user clicks on a room in the lobby.
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';

class RoomModel extends ChangeNotifier {
  int roomNumber;
  int userCount;

  RoomModel(this.roomNumber, this.userCount);

  void addUser() {
    userCount++;
    notifyListeners();
  }

  void startGame() {
    // Add your start game logic here
  }

  void exit() {
    // Add your exit logic here
  }
}

void showRoomDialog(BuildContext context, var roomNumber, int userCount) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return ChangeNotifierProvider(
        create: (context) => RoomModel(roomNumber, userCount),
        child: AlertDialog(
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
                Provider.of<RoomModel>(context, listen: false).exit();
              },
            ),
          ],
        ),
      );
    },
  );
}