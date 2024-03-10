
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


class StartGameData {
  List<dynamic> players;
  Map<String, dynamic> trumpCard;
  Map<String, dynamic> pot;



  StartGameData({required this.players, required this.trumpCard, required this.pot});

  factory StartGameData.fromJson(Map<String, dynamic> json) {
    return StartGameData(
      players: json['players'],
      trumpCard: json['trumpCard'],
      pot: json['pot'],
  
    );
  }
}