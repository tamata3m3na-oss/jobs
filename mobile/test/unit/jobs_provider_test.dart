import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartjob/features/jobs/presentation/providers/jobs_provider.dart';
import 'package:smartjob/features/jobs/domain/repositories/job_repository.dart';
import 'package:smartjob/shared/models/job_model.dart';
import 'package:smartjob/shared/utils/api_result.dart';
import 'package:smartjob/core/error/failures.dart';

import 'package:smartjob/core/di/injection.dart';

void main() {
  group('JobsProvider Tests', () {
    setUpAll(() {
      getIt.registerLazySingleton<JobRepository>(() => MockJobRepository());
    });

    tearDownAll(() {
      getIt.reset();
    });

    test('Initial job type filter should be null', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final filter = container.read(jobTypeFilterProvider);
      expect(filter, isNull);
    });

    test('Initial search query should be empty', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final query = container.read(jobSearchQueryProvider);
      expect(query, isEmpty);
    });

    test('jobSearchQueryProvider should update state', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(jobSearchQueryProvider.notifier).state = 'flutter';

      expect(container.read(jobSearchQueryProvider), 'flutter');
    });

    test('jobTypeFilterProvider should update state', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      container.read(jobTypeFilterProvider.notifier).state = JobType.fullTime;

      expect(container.read(jobTypeFilterProvider), JobType.fullTime);
    });
  });

  group('JobModel Tests', () {
    test('JobModel.salaryRange should format salary correctly', () {
      final job = JobModel(
        id: '1',
        title: 'Test Job',
        companyName: 'Test Company',
        description: 'Test description',
        location: 'New York',
        salaryMin: '50000',
        salaryMax: '70000',
        salaryCurrency: 'USD',
      );

      expect(job.salaryRange, '50000 - 70000 USD');
    });

    test('JobModel.salaryRange should handle only min salary', () {
      final job = JobModel(
        id: '1',
        title: 'Test Job',
        companyName: 'Test Company',
        description: 'Test description',
        location: 'New York',
        salaryMin: '50000',
      );

      expect(job.salaryRange, 'From 50000 ');
    });

    test('JobModel.isActive should return true for active status', () {
      final job = JobModel(
        id: '1',
        title: 'Test Job',
        companyName: 'Test Company',
        description: 'Test description',
        location: 'New York',
        status: JobStatus.active,
      );

      expect(job.isActive, isTrue);
    });

    test('JobModel.isActive should return false for closed status', () {
      final job = JobModel(
        id: '1',
        title: 'Test Job',
        companyName: 'Test Company',
        description: 'Test description',
        location: 'New York',
        status: JobStatus.closed,
      );

      expect(job.isActive, isFalse);
    });

    test('JobModel.formattedDistance should format in meters for < 1km', () {
      final job = JobModel(
        id: '1',
        title: 'Test Job',
        companyName: 'Test Company',
        description: 'Test description',
        location: 'New York',
        distance: 0.5,
      );

      expect(job.formattedDistance, '500 m');
    });

    test('JobModel.formattedDistance should format in km for >= 1km', () {
      final job = JobModel(
        id: '1',
        title: 'Test Job',
        companyName: 'Test Company',
        description: 'Test description',
        location: 'New York',
        distance: 2.5,
      );

      expect(job.formattedDistance, '2.5 km');
    });
  });

  group('JobsState Tests', () {
    test('JobsState default values should be correct', () {
      const state = JobsState();

      expect(state.jobs, isEmpty);
      expect(state.isLoadingMore, isFalse);
      expect(state.currentPage, 1);
      expect(state.hasMore, isTrue);
      expect(state.error, isNull);
    });

    test('JobsState.copyWith should update fields correctly', () {
      const state = JobsState();
      final newState = state.copyWith(
        currentPage: 2,
        hasMore: false,
      );

      expect(newState.currentPage, 2);
      expect(newState.hasMore, isFalse);
      expect(newState.jobs, isEmpty);
    });
  });
}

class MockJobRepository implements JobRepository {
  @override
  Future<ApiResult<List<JobModel>>> getJobs({
    int page = 1,
    int limit = 20,
    String? query,
    String? jobType,
    String? location,
  }) async {
    return ApiResult.success(
      data: [
        JobModel(
          id: '1',
          title: 'Flutter Developer',
          companyName: 'Tech Corp',
          description: 'Great opportunity',
          location: 'New York',
        ),
      ],
    );
  }

  @override
  Future<ApiResult<JobModel>> getJobById(String id) async {
    return ApiResult.success(
      data: JobModel(
        id: id,
        title: 'Flutter Developer',
        companyName: 'Tech Corp',
        description: 'Great opportunity',
        location: 'New York',
      ),
    );
  }

  @override
  Future<ApiResult<ApplicationModel>> applyToJob({
    required String jobId,
    String? coverLetter,
    List<String>? answers,
  }) async {
    return ApiResult.success(
      data: ApplicationModel(
        id: '1',
        jobId: jobId,
        userId: 'user1',
        status: 'pending',
        appliedAt: DateTime.now(),
      ),
    );
  }

  @override
  Future<ApiResult<List<ApplicationModel>>> getMyApplications() async {
    return ApiResult.success(data: []);
  }

  @override
  Future<ApiResult<ApplicationModel>> getApplicationById(String id) async {
    return ApiResult.success(
      data: ApplicationModel(
        id: id,
        jobId: 'job1',
        userId: 'user1',
        status: 'pending',
        appliedAt: DateTime.now(),
      ),
    );
  }

  @override
  Future<ApiResult<void>> withdrawApplication(String id) async {
    return ApiResult.success(data: null);
  }

  @override
  Future<ApiResult<List<JobModel>>> getSavedJobs() async {
    return ApiResult.success(data: []);
  }

  @override
  Future<ApiResult<void>> saveJob(String jobId) async {
    return ApiResult.success(data: null);
  }

  @override
  Future<ApiResult<void>> unsaveJob(String jobId) async {
    return ApiResult.success(data: null);
  }

  @override
  Future<ApiResult<List<JobModel>>> getRecommendedJobs() async {
    return ApiResult.success(data: []);
  }
}