import 'dart:convert';
import 'dart:io' show Platform;
// api.dart
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';


// Define the server URL
final serverUrl = Platform.isAndroid? 'http://10.0.2.2:3000' : Platform.isIOS? 'http://127.0.0.1:3000' : 'http://localhost:3000';


Future<String> createGameRoom() async {
  var uuid = const Uuid();
  String playerId = uuid.v4(); // Generate a random player ID

  final response = await http.post(
    Uri.parse('$serverUrl/createGameRoom'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'playerId': playerId,
    }),
  );

  if (response.statusCode == 200) {
    // If the server returns a 200 OK response, parse the JSON.
    return jsonDecode(response.body)['roomId'];
  } else {
    // If the server returns an unsuccessful response code, throw an exception.
    throw Exception('Failed to create game room');
  }
}

Future<http.Response> test() async {
  var url = Uri.parse('$serverUrl/');
  var messege = await http.get(url);
  return messege;
}

Future<void> deleteGameRoom(String roomId) async {
  final response = await http.delete(Uri.parse('$serverUrl/deleteGameRooms/$roomId'));

  if (response.statusCode != 200) {
    throw Exception('Failed to delete game room');
  }
}