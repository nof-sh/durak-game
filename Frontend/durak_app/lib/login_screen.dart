import 'dart:io';
import 'package:flutter/material.dart';
import 'package:durak_app/main_menu.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'package:logging/logging.dart';

final Logger _log = Logger('LoginScreen');

// Define the server URL
final serverUrl = Platform.isAndroid? 'http://10.0.2.2:3000' : Platform.isIOS? 'http://127.0.0.1:3000' : 'http://localhost:3000';

class LoginScreen extends StatelessWidget {
  final TextEditingController _nameController = TextEditingController();

  LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                hintText: 'Enter your name',
              ),
            ),
            ElevatedButton(
              child: const Text('Login'),
              onPressed: () {
                // Connect to the server
                io.Socket socket = io.io(serverUrl, <String, dynamic>{
                  'transports': ['websocket'],
                });
                // Emit a 'playerName' event with the player's name
                socket.emit('playerName', _nameController.text);
                socket.onConnect((_) {
                  _log.info('Connected');
                  // When the connection is successful, navigate to the main menu
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => MainMenu(_nameController.text, socket)),
                  );
                });
                socket.onConnectError((data) {
                  _log.info('Connection error: $data');
                });
                socket.onConnectTimeout((data) {
                  _log.info('Connection timeout: $data');
                });
                socket.onError((data) {
                  _log.info('Error: $data');
                });
                socket.onDisconnect((_) {
                  _log.info('Disconnected');
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}