import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/job_repository.dart';
import 'job_event.dart';
import 'job_state.dart';

class JobBloc extends Bloc<JobEvent, JobState> {
  final JobRepository jobRepository;

  JobBloc({required this.jobRepository}) : super(JobInitial()) {
    on<LoadNearbyJobs>((event, emit) async {
      emit(JobLoading());
      final result = await jobRepository.getNearbyJobs(
        latitude: event.latitude,
        longitude: event.longitude,
        radius: event.radius,
      );
      result.fold(
        (failure) => emit(JobError(failure.message)),
        (jobs) => emit(JobsLoaded(jobs)),
      );
    });
  }
}
