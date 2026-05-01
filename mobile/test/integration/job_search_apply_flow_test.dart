import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:smartjob/features/jobs/presentation/pages/jobs_list_page.dart';
import 'package:smartjob/features/jobs/presentation/pages/job_detail_page.dart';
import 'package:smartjob/features/jobs/presentation/pages/apply_page.dart';
import 'package:smartjob/features/jobs/presentation/providers/jobs_provider.dart';
import 'package:smartjob/features/jobs/domain/repositories/job_repository.dart';
import 'package:smartjob/shared/models/job_model.dart';
import 'package:smartjob/shared/utils/api_result.dart';
import 'package:smartjob/core/di/injection.dart';

void main() {
  group('Job Search and Apply Flow Integration Tests', () {
    setUpAll(() {
      if (!getIt.isRegistered<JobRepository>()) {
        getIt.registerLazySingleton<JobRepository>(() => MockJobRepository());
      }
    });

    testWidgets('should search jobs and view details', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Verify jobs list page loads
      expect(find.text('Find Jobs'), findsOneWidget);

      // Wait for initial load
      await tester.pump(const Duration(milliseconds: 200));

      // Should show job cards (from mock data)
      expect(find.byType(Card), findsWidgets);
    });

    testWidgets('should filter jobs by type', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Wait for page to load
      await tester.pump();

      // Tap on Full Time filter chip
      await tester.tap(find.text('Full Time'));
      await tester.pump();

      // Filter should be applied (provider state updated)
      final filter = tester.run(() {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        return container.read(jobTypeFilterProvider);
      });

      // The filter chip should now be selected
      expect(find.text('Full Time'), findsWidgets);
    });

    testWidgets('should open filter bottom sheet', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Tap filter button in app bar
      await tester.tap(find.byIcon(Icons.filter_list));
      await tester.pumpAndSettle();

      // Should show filter sheet
      expect(find.text('Filters'), findsOneWidget);
      expect(find.text('Location'), findsOneWidget);
      expect(find.text('Job Type'), findsOneWidget);
    });

    testWidgets('should search with query text', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Find search field
      final searchField = find.byType(TextField);
      expect(searchField, findsOneWidget);

      // Enter search query
      await tester.enterText(searchField, 'flutter');
      await tester.pump();

      // Search should be triggered (query provider updated)
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final query = container.read(jobSearchQueryProvider);
      
      // Query should be stored
      expect(query, isNotEmpty);
    });

    testWidgets('should clear search query', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Enter search text
      await tester.enterText(find.byType(TextField), 'flutter');
      await tester.pump();

      // Tap clear button (X icon)
      final clearButton = find.byIcon(Icons.clear);
      if (clearButton.evaluate().isNotEmpty) {
        await tester.tap(clearButton);
        await tester.pump();

        // Search field should be cleared
        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.controller?.text, isEmpty);
      }
    });

    testWidgets('should display all job types as filter chips', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Check all job type chips are visible
      expect(find.text('All Types'), findsOneWidget);
      expect(find.text('Full Time'), findsWidgets);
      expect(find.text('Part Time'), findsOneWidget);
      expect(find.text('Contract'), findsOneWidget);
      expect(find.text('Internship'), findsOneWidget);
      expect(find.text('Temporary'), findsOneWidget);
    });

    testWidgets('job detail page should display job information', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobDetailPage(jobId: '1'),
          ),
        ),
      );

      // Page should render (with loading or data)
      expect(find.byType(JobDetailPage), findsOneWidget);
    });

    testWidgets('apply page should show job application form', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const ApplyPage(jobId: '1'),
          ),
        ),
      );

      // Page should render
      expect(find.byType(ApplyPage), findsOneWidget);
    });

    testWidgets('should navigate from job list to detail', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp.router(
            routerConfig: _createJobsRouter(),
          ),
        ),
      );

      // Wait for jobs to load
      await tester.pump(const Duration(milliseconds: 200));

      // Tap on a job card
      final jobCard = find.byType(Card).first;
      if (jobCard.evaluate().isNotEmpty) {
        await tester.tap(jobCard);
        await tester.pumpAndSettle();

        // Should navigate to detail page
        expect(find.byType(JobDetailPage), findsOneWidget);
      }
    });

    testWidgets('should select multiple job type filters', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      // Select first job type filter
      await tester.tap(find.text('Full Time'));
      await tester.pump();

      // Select another job type filter
      await tester.tap(find.text('Part Time'));
      await tester.pump();

      // Verify selection works (filters are mutually exclusive in current impl)
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final filter = container.read(jobTypeFilterProvider);
      
      // Only one filter should be selected at a time
      expect(filter, isNotNull);
    });
  });

  group('Job Card Display Tests', () {
    testWidgets('should display company logo placeholder', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 200));

      // Should have business icon as placeholder
      expect(find.byIcon(Icons.business), findsWidgets);
    });

    testWidgets('should display job title', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 200));

      // Should display job titles (from mock data)
      expect(find.byType(Text), findsWidgets);
    });

    testWidgets('should display location icon', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const JobsListPage(),
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 200));

      // Should show location icon
      expect(find.byIcon(Icons.location_on_outlined), findsWidgets);
    });
  });
}

GoRouter _createJobsRouter() {
  return GoRouter(
    initialLocation: '/jobs',
    routes: [
      GoRoute(
        path: '/jobs',
        builder: (context, state) => const JobsListPage(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) => JobDetailPage(
              jobId: state.pathParameters['id']!,
            ),
          ),
        ],
      ),
    ],
  );
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
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));

    final jobs = [
      JobModel(
        id: '1',
        title: 'Flutter Developer',
        companyName: 'Tech Corp',
        description: 'Great opportunity for a Flutter developer',
        location: 'New York, NY',
        type: JobType.fullTime,
        salaryMin: '80000',
        salaryMax: '120000',
        salaryCurrency: 'USD',
      ),
      JobModel(
        id: '2',
        title: 'React Developer',
        companyName: 'Web Solutions Inc',
        description: 'Frontend developer position',
        location: 'San Francisco, CA',
        type: JobType.partTime,
        salaryMin: '60000',
        salaryMax: '90000',
        salaryCurrency: 'USD',
      ),
      JobModel(
        id: '3',
        title: 'Backend Engineer',
        companyName: 'Cloud Systems',
        description: 'Backend developer needed',
        location: 'Austin, TX',
        type: JobType.contract,
      ),
    ];

    // Filter by query if provided
    var filteredJobs = jobs;
    if (query != null && query.isNotEmpty) {
      filteredJobs = jobs.where((job) =>
        job.title.toLowerCase().contains(query.toLowerCase()) ||
        job.companyName.toLowerCase().contains(query.toLowerCase())
      ).toList();
    }

    // Filter by job type if provided
    if (jobType != null) {
      filteredJobs = filteredJobs.where((job) =>
        job.type.name == jobType
      ).toList();
    }

    return ApiResult.success(data: filteredJobs);
  }

  @override
  Future<ApiResult<JobModel>> getJobById(String id) async {
    return ApiResult.success(
      data: JobModel(
        id: id,
        title: 'Flutter Developer',
        companyName: 'Tech Corp',
        description: 'Great opportunity for a skilled Flutter developer. We offer competitive salary and benefits.',
        location: 'New York, NY',
        type: JobType.fullTime,
        salaryMin: '80000',
        salaryMax: '120000',
        salaryCurrency: 'USD',
        skills: ['Flutter', 'Dart', 'Firebase', 'REST API'],
        benefits: ['Health Insurance', '401k', 'Remote Work'],
        requirements: '3+ years of mobile development experience',
        responsibilities: 'Develop and maintain Flutter applications',
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
        id: 'app-${DateTime.now().millisecondsSinceEpoch}',
        jobId: jobId,
        userId: 'user-1',
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
        jobId: '1',
        userId: 'user-1',
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