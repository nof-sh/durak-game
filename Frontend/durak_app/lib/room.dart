// This file contains the logic for the room dialog that is displayed when the user clicks on a room in the lobby.
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

