// ignore_for_file: avoid_print

import 'dart:convert';

import 'package:durak_app/room.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart';

// Import api.dart
import 'api.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Durak Game App',
      home: LoginScreen(),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: <Widget>[
            TextField(
              controller: _controller,
              decoration: const InputDecoration(labelText: 'Enter your name'),
            ),
            ElevatedButton(
              child: const Text('OK'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => MenuScreen(_controller.text)),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class MenuScreen extends StatelessWidget {
  final String name;

  const MenuScreen(this.name, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Welcome, $name')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ElevatedButton(
              child: const Text('Create Room'),
              onPressed: () async {
                try {
                  Response response = await createGameRoom();
                  var roomNumber = jsonDecode(response.body);
                  // ignore: use_build_context_synchronously
                  showRoomDialog(context, roomNumber['roomId'], 1);
                } catch (e) {
                  print('Caught error: $e');
                }
              },
            ),
            const Padding(padding: EdgeInsets.all(10)),
            ElevatedButton(
              child: const Text('Join Room'),
              onPressed: () {
                // Implement join room functionality
              },
            ),
            const Padding(padding: EdgeInsets.all(10)),
            ElevatedButton(
              child: const Text('Exit'),
              onPressed: () {
                SystemNavigator.pop(); // Exit the app
              },
            ),
            ElevatedButton(
              child: const Text('test'),
              onPressed: () async{
                try {
                  var response = await test();
                  if (response.statusCode == 200) {
                    print('test completed successfully - ${response.body}');
                  } else {
                    print('Failed to test the server connection - ${response.statusCode}');
                  }
                 // Exit the app
                } catch (e) {
                  print('Caught error: $e');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}