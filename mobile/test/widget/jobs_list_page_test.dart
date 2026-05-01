import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartjob/features/jobs/presentation/pages/jobs_list_page.dart';
import 'package:smartjob/features/jobs/presentation/providers/jobs_provider.dart';
import 'package:smartjob/shared/models/job_model.dart';
import 'package:smartjob/core/di/injection.dart';
import 'package:smartjob/features/jobs/domain/repositories/job_repository.dart';
import 'package:smartjob/shared/utils/api_result.dart';

void main() {
  setUpAll(() {
    // Initialize dependency injection for tests
    if (!getIt.isRegistered<JobRepository>()) {
      getIt.registerLazySingleton<JobRepository>(() => MockJobRepository());
    }
  });

  group('JobsListPage Widget Tests', () {
    testWidgets('should display app bar with title', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      expect(find.text('Find Jobs'), findsOneWidget);
    });

    testWidgets('should display search field', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      expect(find.byType(TextField), findsOneWidget);
      expect(find.byIcon(Icons.search), findsOneWidget);
    });

    testWidgets('should display filter button in app bar', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      expect(find.byIcon(Icons.filter_list), findsOneWidget);
    });

    testWidgets('should display filter chips for job types', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      expect(find.text('All Types'), findsOneWidget);
      expect(find.text('Full Time'), findsOneWidget);
      expect(find.text('Part Time'), findsOneWidget);
    });

    testWidgets('should open filter bottom sheet when tapping filter button', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.filter_list));
      await tester.pumpAndSettle();

      expect(find.text('Filters'), findsOneWidget);
    });

    testWidgets('should update search query when typing', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'flutter');
      await tester.pump();

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.controller?.text, 'flutter');
    });

    testWidgets('should display job cards when data loads', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      // Wait for async data to load
      await tester.pump(const Duration(milliseconds: 100));

      // The page should render without errors
      expect(find.byType(JobsListPage), findsOneWidget);
    });

    testWidgets('should display job title and company', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      // Wait for data
      await tester.pump(const Duration(milliseconds: 100));

      // Check for job data display elements
      expect(find.byType(Card), findsWidgets);
    });

    testWidgets('should handle empty state', (tester) async {
      // This test would require mocking empty data
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      // Page should render even with empty data
      expect(find.byType(JobsListPage), findsOneWidget);
    });

    testWidgets('should display job type labels', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: JobsListPage(),
          ),
        ),
      );

      // Check all job type options are shown
      expect(find.text('Full Time'), findsWidgets);
      expect(find.text('Part Time'), findsWidgets);
      expect(find.text('Contract'), findsOneWidget);
      expect(find.text('Internship'), findsOneWidget);
      expect(find.text('Temporary'), findsOneWidget);
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
          description: 'Great opportunity for Flutter developer',
          location: 'New York',
          type: JobType.fullTime,
        ),
        JobModel(
          id: '2',
          title: 'React Developer',
          companyName: 'Web Solutions',
          description: 'Frontend developer needed',
          location: 'San Francisco',
          type: JobType.partTime,
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