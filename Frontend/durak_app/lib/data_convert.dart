class JoinRoomData {
  final String id;
  final String number;

  JoinRoomData(this.id, this.number);

  Map<String, dynamic> joinRoomToJson() {
    return {
      'id': id,
      'number': number,
    };
  }
}