// ignore_for_file: library_private_types_in_public_api, avoid_print

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

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
  _LoginScreenState createState() => _LoginScreenState();
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
                  var response = await createGameRoom();
                  if (response.statusCode == 200) {
                    print('Room created successfully');
                  } else {
                    print('Failed to create room: ${response.statusCode}');
                  }
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
                    print('test');
                  } else {
                    print('Failed to create room: ${response.statusCode}');
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