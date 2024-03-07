
class JoinRoomData {
  final String playerId;
  final String roomId;

  JoinRoomData(this.playerId, this.roomId);

  Map<String, dynamic> joinRoomToJson() {
    return {
      'playerId': playerId,
      'roomId': roomId,
    };
  }
}


class GameData {
  final List <Map<String, dynamic>> players;
  int currentPlayerIndex;
  final int? firstPlayer;
  List <Map<String, dynamic>> pot;
  final Map<String, dynamic> trumpCard;
  List <Map<String, dynamic>> board = [];

  GameData({
    required this.players,
    required this.currentPlayerIndex,
    this.firstPlayer,
    required this.pot,
    required this.trumpCard,
    required this.board,
  });

  // Convert a GameData object into a Map
  Map<String, dynamic> toJson() {
    return {
      'players': players,
      'currentPlayerIndex': currentPlayerIndex,
      'firstPlayer': firstPlayer,
      'pot': pot,
      'trumpCard': trumpCard,
      'board': board,
    };
  }

  // Create a GameData object from a Map
 factory GameData.fromJson(Map<String, dynamic> json) {
  return GameData(
    players: json['players'] != null ? List<Map<String, dynamic>>.from(json['players']) : [],
    currentPlayerIndex: json['currentPlayerIndex'] ?? 0,
    firstPlayer: json['firstPlayer'],
    pot: json['pot'] != null ? List<Map<String, dynamic>>.from(json['pot']) : [],
    trumpCard: json['trumpCard'] ?? {},
    board: json['board'] != null ? List<Map<String, dynamic>>.from(json['board']) : [],
  );
}

  // add a card to the board
  void addCardToBoard(Map<String, dynamic> card) {
    board.add(card);
  }
}