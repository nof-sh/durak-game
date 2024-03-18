import 'dart:io';
import 'package:durak_app/errors_screen.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:durak_app/data_convert.dart';

final serverUrl = Platform.isAndroid? 'http://10.0.2.2:3000/' : Platform.isIOS? 'http://127.0.0.1:3000/' : 'http://localhost:3000/';
const cardSizeImage = 1.5;

class PlayGameScreen extends StatefulWidget {
  final String playerName;
  final String roomId;
  final io.Socket socket;
  final dynamic gameData;

  const PlayGameScreen(this.gameData, this.playerName,this.roomId, this.socket, {super.key});

  @override
  State<PlayGameScreen> createState() => _PlayGameScreenState();
}

class _PlayGameScreenState extends State<PlayGameScreen> {
  List<dynamic> tableCards = [];
  List<dynamic> myCards = [];
  List<dynamic> otherPlayers = [];
  List<dynamic> otherPlayersCards = [];
  Map<String, dynamic> pot = {};
  Map<String, dynamic> trumpCard = {};
  Map<String, dynamic> myPlayerObject = {};
  String correntPlayerName = "";

  @override
  void initState() {
    super.initState();
    setState(() {
      StartGameData gameObject = StartGameData.fromJson(widget.gameData);
      tableCards = [];
      pot = gameObject.pot;
      trumpCard = gameObject.trumpCard;
      myPlayerObject = gameObject.players.firstWhere((player) => player['name'] == widget.playerName);
      myCards = gameObject.players.firstWhere((player) => player['name'] == widget.playerName)['hand'];
      otherPlayers = gameObject.players.map((player) => player).where((player) => player['name'] != widget.playerName).toList();
      otherPlayersCards = otherPlayers.map((player) => player['hand']).toList();
      correntPlayerName = gameObject.players[gameObject.currentPlayerIndex]['name']; 
    });

    // Listen for game updates from the server
    widget.socket.on('gameUpdate', (data) {
      // Update the game state
      // i need to do more work on this part in the server and in the gameData class to make it work.
      setState(() {
        StartGameData updatedGameObject = StartGameData.fromJson(data);
        tableCards = [];
        pot = updatedGameObject.pot;
        trumpCard = updatedGameObject.trumpCard;
        myPlayerObject = updatedGameObject.players.firstWhere((player) => player['name'] == widget.playerName);
        myCards = updatedGameObject.players.firstWhere((player) => player['name'] == widget.playerName)['hand'];
        otherPlayers = updatedGameObject.players.map((player) => player).where((player) => player['name'] != widget.playerName).toList();
        otherPlayersCards = otherPlayers.map((player) => player['hand']).toList();
        correntPlayerName = updatedGameObject.players[updatedGameObject.currentPlayerIndex]['name'];
      });
    });

    widget.socket.on('error', (data) {
      Navigator.of(context).push(MaterialPageRoute(builder: (context) => ErrorScreen(data['message'])));
    });
  }

  void playCard(var card) {
    widget.socket.emit('playCard', { 'roomId': widget.roomId, 'player': myPlayerObject ,'card': card });
  }

  void takeCardFromTable(var card) {
    widget.socket.emit('takeCardFromTable', { 'roomId': widget.roomId, 'player': myPlayerObject, 'card': card });
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final cardWidth = screenSize.width / 10;
    final cardHeight = screenSize.height / 5;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text('Game Room ${widget.roomId}'),
            Text('Player: $correntPlayerName', style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
      body: Container(
        color: const Color.fromARGB(255, 83, 185, 180),
        child: Column(
          children: <Widget>[
            Expanded(
              child: LayoutBuilder(
                builder: (BuildContext context, BoxConstraints constraints) {
                  return Stack(
                    children: <Widget>[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          // Trump card on the left side of the pot
                          Expanded(
                            flex: 1,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text('Trump card'),
                                Image.network(
                                  serverUrl + trumpCard['frontCardImageUrl'],
                                  width: cardWidth * cardSizeImage,
                                  height: cardHeight * cardSizeImage,
                                  fit: BoxFit.contain,
                                ),
                              ],
                            ),
                          ),
                          // Pot in the middle of the screen on the left side
                          Expanded(
                            flex: 1,
                            child: Stack(
                              alignment: Alignment.center,
                              children: pot['cards'].asMap().entries.map<Widget>((entry) {
                                int idx = entry.key;
                                var card = entry.value;
                                return Transform.translate(
                                  offset: Offset(idx * 1.0, 0), // Adjust the multiplier as needed
                                  child: Image.network(
                                    serverUrl + card['backCardImageUrl'],
                                    width: cardWidth * cardSizeImage,
                                    height: cardHeight * cardSizeImage,
                                    fit: BoxFit.contain,
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                          // Game table in the middle of the screen on the right side
                          Expanded(
                            flex: 2,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text('Table cards'),
                                ...tableCards.isNotEmpty ? tableCards.map((card) => InkWell(
                                  onTap: () => takeCardFromTable(card),
                                  child:
                                      Padding(
                                        padding: const EdgeInsets.all(6.0),
                                        child: Image.network(
                                          serverUrl + card['frontCardImageUrl'],
                                          width: cardWidth * cardSizeImage,
                                          height: cardHeight * cardSizeImage,
                                          fit: BoxFit.contain,
                                        ),
                                      ),
                                  ),
                                ).toList() : [],
                              ],
                            ),
                          ),
                        ],
                      ),
                      // Player's cards at the bottom
                      Positioned(
                        bottom: 0,
                        child: Row(
                          children: myCards.map((card) => InkWell(
                            onTap: () => playCard(card),
                            child:
                                Padding(
                                  padding: const EdgeInsets.all(2.0),
                                  child: Image.network(
                                    serverUrl + card['frontCardImageUrl'],
                                    width: cardWidth * cardSizeImage,
                                    height: cardHeight * cardSizeImage,
                                    fit: BoxFit.contain,
                                  ),
                                ),
                            ),
                          ).toList(),
                        ),
                      ),
                      // Other players' cards at the top
                      Positioned(
                        top: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: otherPlayersCards.map((playerCards) => Padding(
                            padding: const EdgeInsets.all(8.0), // Add space around each player's cards
                            child: Stack(
                              children: (playerCards ?? []).asMap().entries.map<Widget>((entry) {
                                int idx = entry.key;
                                var card = entry.value;
                                return Transform.translate(
                                  offset: Offset(idx * 2.0, 0), // Adjust the multiplier as needed
                                  child: Image.network(
                                    serverUrl + card['backCardImageUrl'],
                                    width: cardWidth * cardSizeImage, // Increase the width as needed
                                    height: cardHeight * cardSizeImage, // Increase the height as needed
                                    fit: BoxFit.contain,
                                  ),
                                );
                              }).toList(),
                            ),
                          )).toList(),
                        ),
                      ),
                    ].toList(),
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
      ),
    );
  }
}