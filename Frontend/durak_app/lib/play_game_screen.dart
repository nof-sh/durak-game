import 'package:durak_app/errors_screen.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class PlayGameScreen extends StatefulWidget {
  final String roomId;
  final io.Socket socket;

  const PlayGameScreen(this.roomId, this.socket, {super.key});

  @override
  State<PlayGameScreen> createState() => _PlayGameScreenState();
}

class _PlayGameScreenState extends State<PlayGameScreen> {
  var playerObject = {};
  String myName = '';
  var myCards = {};
  var tableCards = {};
  String trumpCard = '';
  var pot = {};
  var gameObject = {};
  var otherPlayersCards = [];
  
  get cardImages => null;


  @override
  void initState() {
    super.initState();
    widget.socket.on('gameStarted', (data) {
      setState(() {
        playerObject = data['players'][myName];
        myCards = data['playerCards'];
        trumpCard = data['trumpCard'];
        pot = data['pot'];
        gameObject = data['gameObject'];
        otherPlayersCards = data['players'];
        otherPlayersCards.removeWhere((player) => player['name'] == myName);

      });
    });
    widget.socket.on('turnPlayed', (data) {
      setState(() {
        tableCards.addEntries(data['tableCards']);
      });
    });
    widget.socket.on('error', (data) {
      // Show error message
      Navigator.of(context).push(MaterialPageRoute(builder: (context) => ErrorScreen(data['message'])));
    });
  }

  void playCard(var card) {
    widget.socket.emit('playCard', { 'roomId': widget.roomId, 'player': playerObject ,'card': card });
  }

  void takeCardFromTable(var card) {
    widget.socket.emit('takeCardFromTable', { 'roomId': widget.roomId, 'player': playerObject, 'card': card });
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Game Room ${widget.roomId}'),
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            child: LayoutBuilder(
              builder: (BuildContext context, BoxConstraints constraints) {
                return Stack(
                  children: <Widget>[
                    // Game table in the center
                    Positioned(
                      left: constraints.maxWidth / 2 - 50,
                      top: constraints.maxHeight / 2 - 50,
                      child: Row(
                        children: tableCards.entries.map((MapEntry<dynamic, dynamic> card) => InkWell(
                          onTap: () => takeCardFromTable(card),
                          child: Card(
                            child: Image.network(card.value['frontCardImageUrl']),
                          ),
                        )).toList(),
                      ),
                    ),
                    // Player's cards at the bottom
                    Positioned(
                      bottom: 0,
                      child: Row(
                        children: myCards.entries.map((MapEntry<dynamic, dynamic> card) => InkWell(
                          onTap: () => playCard(card),
                          child: Card(
                            child: Image.network(card.value['frontCardImageUrl']),
                          ),
                        )).toList(),
                      ),
                    ),
                    // Other players' cards at the top, left, and right
                    // You'll need to replace 'otherPlayersCards' with the actual data
                    Positioned(
                      top: 0,
                      child: Row(
                        children: otherPlayersCards[0].map((card) => Image.network(card)).toList(),
                      ),
                    ),
                    if (otherPlayersCards.length > 1)
                      Positioned(
                        left: 0,
                        child: Column(
                          children: otherPlayersCards[1].map((card) => Image.network(card)).toList(),
                        ),
                      ),
                    if (otherPlayersCards.length > 2)
                      Positioned(
                        right: 0,
                        child: Column(
                          children: otherPlayersCards[2].map((card) => Image.network(card)).toList(),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: <Widget>[
              ElevatedButton(
                child: const Text('End Turn'),
                onPressed: () {
                  // Implement your logic to end the turn
                },
              ),
              ElevatedButton(
                child: const Text('Exit Game'),
                onPressed: () {
                  // Implement your logic to exit the game
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}