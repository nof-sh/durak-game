import 'package:flutter/material.dart';
import 'package:durak_app/login_screen.dart';
import 'package:logging/logging.dart';


void main() {
  Logger.root.level = Level.ALL; // Set this level to control which log messages are shown
  Logger.root.onRecord.listen((record) {
    // ignore: avoid_print
    print('${record.level.name}: ${record.time}: ${record.message}');
  });

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Durak Game',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: LoginScreen(),
    );
  }
}