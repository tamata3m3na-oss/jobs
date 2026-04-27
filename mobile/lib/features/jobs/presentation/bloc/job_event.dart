import 'package:equatable/equatable.dart';

abstract class JobEvent extends Equatable {
  const JobEvent();

  @override
  List<Object> get props => [];
}

class LoadNearbyJobs extends JobEvent {
  final double latitude;
  final double longitude;
  final double radius;

  const LoadNearbyJobs({
    required this.latitude,
    required this.longitude,
    this.radius = 10.0,
  });

  @override
  List<Object> get props => [latitude, longitude, radius];
}
