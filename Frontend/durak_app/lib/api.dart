// api.dart
import 'package:http/http.dart' as http;

var serverUrl = 'http://localhost:3000';

Future<http.Response> createGameRoom() {
  var url = Uri.parse('$serverUrl/createGameRoom');
  return http.post(url);
}

Future<http.Response> test() {
  var url = Uri.parse(serverUrl);
  var messege = http.get(url);
  return messege;
}