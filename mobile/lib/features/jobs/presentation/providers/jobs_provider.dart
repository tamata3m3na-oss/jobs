import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/di/injection.dart';
import '../../../../shared/models/application_model.dart';
import '../../../../shared/models/job_model.dart';
import '../../../../shared/utils/api_result.dart';
import '../../domain/repositories/job_repository.dart';

/// Job repository provider
final jobRepositoryProvider = Provider<JobRepository>((ref) {
  return sl<JobRepository>();
});

/// Job search query provider
final jobSearchQueryProvider = StateProvider<String>((ref) => '');

/// Job filters provider
final jobTypeFilterProvider = StateProvider<JobType?>((ref) => null);
final jobLocationFilterProvider = StateProvider<String?>((ref) => null);

/// Jobs list state
class JobsState {
  final List<JobModel> jobs;
  final bool isLoadingMore;
  final int currentPage;
  final bool hasMore;
  final String? error;

  JobsState({
    this.jobs = const [],
    this.isLoadingMore = false,
    this.currentPage = 1,
    this.hasMore = true,
    this.error,
  });

  JobsState copyWith({
    List<JobModel>? jobs,
    bool? isLoadingMore,
    int? currentPage,
    bool? hasMore,
    String? error,
  }) {
    return JobsState(
      jobs: jobs ?? this.jobs,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      error: error,
    );
  }
}

/// Jobs list notifier
class JobsNotifier extends AutoDisposeAsyncNotifier<JobsState> {
  @override
  Future<JobsState> build() async {
    final query = ref.watch(jobSearchQueryProvider);
    final type = ref.watch(jobTypeFilterProvider);
    final location = ref.watch(jobLocationFilterProvider);
    
    return _fetchJobs(page: 1, query: query, type: type, location: location);
  }

  Future<JobsState> _fetchJobs({
    required int page,
    String? query,
    JobType? type,
    String? location,
  }) async {
    final repository = ref.read(jobRepositoryProvider);
    final result = await repository.getJobs(
      page: page,
      query: query?.isEmpty ?? true ? null : query,
      jobType: type?.name,
      location: location,
    );

    return result.when(
      success: (jobs, _, __) {
        return JobsState(
          jobs: jobs,
          currentPage: page,
          hasMore: jobs.length >= 20,
        );
      },
      failure: (failure, _) {
        throw failure.message;
      },
      loading: () => JobsState(),
      initial: () => JobsState(),
    );
  }

  Future<void> loadMore() async {
    final currentState = state.value;
    if (currentState == null || currentState.isLoadingMore || !currentState.hasMore) {
      return;
    }

    state = AsyncValue.data(currentState.copyWith(isLoadingMore: true));

    final nextPage = currentState.currentPage + 1;
    final query = ref.read(jobSearchQueryProvider);
    final type = ref.read(jobTypeFilterProvider);
    final location = ref.read(jobLocationFilterProvider);

    final repository = ref.read(jobRepositoryProvider);
    final result = await repository.getJobs(
      page: nextPage,
      query: query.isEmpty ? null : query,
      jobType: type?.name,
      location: location,
    );

    state = AsyncValue.data(result.when(
      success: (jobs, _, __) {
        return currentState.copyWith(
          jobs: [...currentState.jobs, ...jobs],
          isLoadingMore: false,
          currentPage: nextPage,
          hasMore: jobs.length >= 20,
        );
      },
      failure: (failure, _) {
        return currentState.copyWith(
          isLoadingMore: false,
          error: failure.message,
        );
      },
      loading: () => currentState,
      initial: () => currentState,
    ));
  }

  Future<void> refresh() async {
    // This will trigger build() to run again because we use ref.invalidate
    ref.invalidateSelf();
  }
}

final jobsProvider = AsyncNotifierProvider.autoDispose<JobsNotifier, JobsState>(() {
  return JobsNotifier();
});

/// Job detail provider
final jobDetailProvider = FutureProvider.autoDispose.family<JobModel, String>((ref, id) async {
  final repository = ref.read(jobRepositoryProvider);
  final result = await repository.getJobById(id);
  return result.when(
    success: (job, _, __) => job,
    failure: (failure, _) => throw failure.message,
    loading: () => throw 'Loading',
    initial: () => throw 'Initial',
  );
});

/// Apply to job state
final applyToJobProvider = StateNotifierProvider.autoDispose<ApplyToJobNotifier, ApiResult<ApplicationModel>>((ref) {
  return ApplyToJobNotifier(ref.read(jobRepositoryProvider));
});

class ApplyToJobNotifier extends StateNotifier<ApiResult<ApplicationModel>> {
  final JobRepository _repository;

  ApplyToJobNotifier(this._repository) : super(const ApiResult.initial());

  Future<void> apply({
    required String jobId,
    String? coverLetter,
    List<String>? answers,
  }) async {
    state = const ApiResult.loading();
    final result = await _repository.applyToJob(
      jobId: jobId,
      coverLetter: coverLetter,
      answers: answers,
    );
    state = result;
  }
}

/// My applications provider
final myApplicationsProvider = FutureProvider.autoDispose<List<ApplicationModel>>((ref) async {
  final repository = ref.read(jobRepositoryProvider);
  final result = await repository.getMyApplications();
  return result.when(
    success: (apps, _, __) => apps,
    failure: (failure, _) => throw failure.message,
    loading: () => [],
    initial: () => [],
  );
});
