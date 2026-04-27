import 'package:equatable/equatable.dart';
import '../../domain/entities/job.dart';

abstract class JobState extends Equatable {
  const JobState();
  
  @override
  List<Object?> get props => [];
}

class JobInitial extends JobState {}

class JobLoading extends JobState {}

class JobsLoaded extends JobState {
  final List<Job> jobs;
  const JobsLoaded(this.jobs);

  @override
  List<Object?> get props => [jobs];
}

class JobError extends JobState {
  final String message;
  const JobError(this.message);

  @override
  List<Object?> get props => [message];
}
