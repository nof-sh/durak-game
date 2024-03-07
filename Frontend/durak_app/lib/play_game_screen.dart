import 'package:durak_app/errors_screen.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:durak_app/data_convert.dart';


class PlayGameScreen extends StatefulWidget {
  final GameData gameObject;
  final List <Map<String, dynamic>> players;
  final Map<String, dynamic> trumpCard;
  final List <Map<String, dynamic>> pot;
  final int? firstPlayer;
  final String roomId;
  final io.Socket socket;
  final String playerName;

  const PlayGameScreen(this.gameObject, this.players, this.trumpCard, this.pot, this.firstPlayer, this.roomId, this.socket, this.playerName, {super.key});

  @override
  State<PlayGameScreen> createState() => _PlayGameScreenState();
}

class _PlayGameScreenState extends State<PlayGameScreen> {
  List <Map<String, dynamic>> playerObject = [];
  List <Map<String, dynamic>> myCards = [];
  Map<String, dynamic> trumpCard = {};
  List <Map<String, dynamic>> pot = [];
  GameData gameObject = GameData(players: [], currentPlayerIndex: 0, pot: [], trumpCard: {}, board: []);
  List <Map<String, dynamic>> otherPlayersCards = [];
  List <Map<String, dynamic>> tableCards = [];



  @override
  void initState() {
    super.initState();
    setState(() {
      gameObject = widget.gameObject;
      playerObject = widget.players.where((player) => player['name'] == widget.playerName).toList();
      myCards = List<Map<String, dynamic>>.from(playerObject[0]['cards']);
      trumpCard = widget.trumpCard;
      pot = widget.pot;
      otherPlayersCards = widget.players.where((player) => player['name'] != widget.playerName).toList();

    });
    widget.socket.on('turnPlayed', (data) {
      setState(() {
        tableCards = data['tableCards'];
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
                        children: tableCards.map((card) => InkWell(
                          onTap: () => takeCardFromTable(card),
                          child: Card(
                            child: Image.network(card['frontCardImageUrl']),
                          ),
                        )).toList(),
                      ),
                    ),
                    // Player's cards at the bottom
                    Positioned(
                      bottom: 0,
                      child: Row(
                        children: [
                          Text(widget.playerName),
                          ...myCards.map((card) => InkWell(
                            onTap: () => playCard(card),
                            child: Card(
                              child: Image.network(card['frontCardImageUrl']),
                            ),
                          ))
                        ],
                      ),
                    ),
                    // Other players' cards at the top, left, and right
                    // You'll need to replace 'otherPlayersCards' with the actual data
                    Positioned(
                      top: 0,
                      left: 0,
                      child: Column(
                        children: otherPlayersCards[0]['cards'].map((card) => Card(
                          child: Image.network(card['backCardImageUrl']),
                        )).toList(),
                      ),
                    ),
                    if (otherPlayersCards.length > 1)
                      Positioned(
                        top: 0,
                        right: 0,
                        child: Column(
                          children: otherPlayersCards[1]['cards'].map((card) => Card(
                            child: Image.network(card['backCardImageUrl']),
                          )).toList(),
                        ),
                      ),
                    if (otherPlayersCards.length > 2)
                      Positioned(
                        bottom: 0,
                        child: Row(
                          children: otherPlayersCards[2]['cards'].map((card) => Card(
                            child: Image.network(card['backCardImageUrl']),
                          )).toList(),
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