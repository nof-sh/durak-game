import 'package:durak_app/errors_screen.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:durak_app/data_convert.dart';



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
  List<dynamic> pot = [];
  List<dynamic> trumpCard = [];
  List<dynamic> myPlayerObject = [];
  



  @override
  void initState() {
    super.initState();
    setState(() {
      GameData gameObject = GameData.fromJson(widget.gameData);
      tableCards = gameObject.tableCards;
      pot = gameObject.pot;
      trumpCard = gameObject.trumpCard;
      myPlayerObject = gameObject.players.firstWhere((player) => player['name'] == widget.playerName);
      myCards = gameObject.players.firstWhere((player) => player['name'] == widget.playerName)['cards'];
      otherPlayers = gameObject.players.where((player) => player['name'] != widget.playerName).toList();
      otherPlayersCards = otherPlayers.map((player) => player['cards']).toList();

 
    });
   
    widget.socket.on('error', (data) {
      // Show error message
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
                  Center(
                    child: Column(
                      children: [
                        const Text('Trump card'),
                        Image.network(trumpCard.firstWhere((cardImage) => cardImage['frontCardImageUrl'])),
                        const Text('Table cards'),
                        ...tableCards.map((card) => InkWell(
                          onTap: () => takeCardFromTable(card),
                          child: Card(
                            child: Image.network(card['frontCardImageUrl']),
                          ),
                        )),
                        const Text('Pot'),
                        ...pot.map((card) => Card(
                          child: Image.network(card['frontCardImageUrl']),
                        )),
                      ],
                    ),
                  ),
                  // Player's cards at the bottom
                  Positioned(
                    bottom: 0,
                    child: Row(
                      children: myCards.map((card) => InkWell(
                        onTap: () => playCard(card),
                        child: Card(
                          child: Image.network(card['frontCardImageUrl']),
                        ),
                      )).toList(),
                    ),
                  ),
                  // Other players' cards at the top, left, and right
                  // You'll need to replace 'otherPlayersCards' with the actual data
                  Stack(
                    children: otherPlayers.map((player) {
                      var index = otherPlayers.indexOf(player);
                      return Positioned(
                        top: index == 0 ? 0 : null,
                        bottom: index == 1 ? 0 : null,
                        left: index == 2 ? 0 : null,
                        right: index == 3 ? 0 : null,
                        child: Row(
                          children: player['cards'].map((card) => Card(
                            child: Image.network(card['backCardImageUrl']),
                          )).toList(),
                        ),
                      );
                    }).toList(),
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