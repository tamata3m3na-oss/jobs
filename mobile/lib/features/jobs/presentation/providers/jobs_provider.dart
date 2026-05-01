import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/models/job_model.dart';
import '../../../core/network/services/jobs_service.dart';
import '../../../core/di/injection.dart';

/// Jobs list state
class JobsState {
  final List<JobModel> jobs;
  final bool isLoading;
  final String? errorMessage;
  final int currentPage;
  final bool hasMore;

  const JobsState({
    this.jobs = const [],
    this.isLoading = false,
    this.errorMessage,
    this.currentPage = 1,
    this.hasMore = true,
  });

  JobsState copyWith({
    List<JobModel>? jobs,
    bool? isLoading,
    String? errorMessage,
    int? currentPage,
    bool? hasMore,
  }) {
    return JobsState(
      jobs: jobs ?? this.jobs,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

/// Jobs service provider
final jobsServiceProvider = Provider<JobsService>((ref) {
  return JobsService(apiClient: ref.read(apiClientProvider));
});

/// Jobs list provider
final jobsProvider = StateNotifierProvider<JobsNotifier, JobsState>((ref) {
  return JobsNotifier(ref.read(jobsServiceProvider));
});

/// Jobs state notifier for managing job listings
class JobsNotifier extends StateNotifier<JobsState> {
  final JobsService _jobsService;

  JobsNotifier(this._jobsService) : super(const JobsState());

  Future<void> loadJobs({bool refresh = false}) async {
    if (state.isLoading) return;

    final page = refresh ? 1 : state.currentPage;

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      currentPage: page,
    );

    try {
      final jobs = await _jobsService.getJobs(
        page: page,
        limit: 20,
      );

      final updatedJobs = refresh ? jobs : [...state.jobs, ...jobs];

      state = state.copyWith(
        jobs: updatedJobs,
        isLoading: false,
        currentPage: page + 1,
        hasMore: jobs.length >= 20,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
    }
  }

  Future<void> loadNearbyJobs({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    bool refresh = false,
  }) async {
    if (state.isLoading) return;

    final page = refresh ? 1 : state.currentPage;

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      currentPage: page,
    );

    try {
      final jobs = await _jobsService.getNearbyJobs(
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        page: page,
        limit: 20,
      );

      final updatedJobs = refresh ? jobs : [...state.jobs, ...jobs];

      state = state.copyWith(
        jobs: updatedJobs,
        isLoading: false,
        currentPage: page + 1,
        hasMore: jobs.length >= 20,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
    }
  }

  Future<void> searchJobs(String query) async {
    if (state.isLoading) return;

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      currentPage: 1,
    );

    try {
      final jobs = await _jobsService.getJobs(
        query: query,
        page: 1,
        limit: 20,
      );

      state = state.copyWith(
        jobs: jobs,
        isLoading: false,
        currentPage: 2,
        hasMore: jobs.length >= 20,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
    }
  }

  Future<void> refresh() => loadJobs(refresh: true);

  void clearJobs() {
    state = const JobsState();
  }

  String _formatError(dynamic error) {
    if (error.toString().contains('network')) {
      return 'Network error. Please check your connection.';
    }
    return 'Failed to load jobs. Please try again.';
  }
}

/// Single job detail provider family
final jobDetailProvider = FutureProvider.family<JobModel, String>((ref, jobId) async {
  final jobsService = ref.read(jobsServiceProvider);
  return jobsService.getJob(jobId);
});

/// Recommended jobs provider
final recommendedJobsProvider = FutureProvider<List<JobModel>>((ref) async {
  final jobsService = ref.read(jobsServiceProvider);
  return jobsService.getRecommendedJobs();
});

/// Saved jobs provider
final savedJobsProvider = FutureProvider<List<JobModel>>((ref) async {
  final jobsService = ref.read(jobsServiceProvider);
  return jobsService.getSavedJobs();
});

/// Job search query provider
final jobSearchQueryProvider = StateProvider<String>((ref) => '');

/// Job type filter provider
final jobTypeFilterProvider = StateProvider<JobType?>((ref) => null);

/// Filtered jobs based on search and filters
final filteredJobsProvider = Provider<List<JobModel>>((ref) {
  final jobsState = ref.watch(jobsProvider);
  final query = ref.watch(jobSearchQueryProvider).toLowerCase();
  final typeFilter = ref.watch(jobTypeFilterProvider);

  var filtered = jobsState.jobs;

  // Filter by search query
  if (query.isNotEmpty) {
    filtered = filtered.where((job) {
      return job.title.toLowerCase().contains(query) ||
          job.companyName.toLowerCase().contains(query) ||
          job.description.toLowerCase().contains(query);
    }).toList();
  }

  // Filter by job type
  if (typeFilter != null) {
    filtered = filtered.where((job) => job.type == typeFilter).toList();
  }

  return filtered;
});