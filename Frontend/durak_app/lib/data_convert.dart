
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
  List<dynamic> players;
  List<dynamic> tableCards;
  List<dynamic> trumpCard;
  List<dynamic> pot;


  GameData({required this.players, required this.tableCards, required this.trumpCard, required this.pot});

  factory GameData.fromJson(Map<String, dynamic> json) {
    return GameData(
      players: json['players'],
      tableCards: json['tableCards'],
      trumpCard: json['trumpCard'],
      pot: json['pot'],
    );
  }
}