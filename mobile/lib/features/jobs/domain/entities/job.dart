import 'package:equatable/equatable.dart';

class Job extends Equatable {
  final String id;
  final String title;
  final String companyName;
  final String description;
  final double latitude;
  final double longitude;
  final double? distance;
  final String? salary;

  const Job({
    required this.id,
    required this.title,
    required this.companyName,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.distance,
    this.salary,
  });

  @override
  List<Object?> get props => [id, title, companyName, description, latitude, longitude, distance, salary];
}
