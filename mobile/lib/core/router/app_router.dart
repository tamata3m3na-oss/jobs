import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/jobs/presentation/pages/apply_page.dart';
import '../../features/jobs/presentation/pages/job_detail_page.dart';
import '../../features/jobs/presentation/pages/jobs_list_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/settings_page.dart';
import '../../features/profile/presentation/providers/settings_provider.dart';
import '../../shared/widgets/loading_widget.dart';

/// Route names for type-safe navigation
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String jobs = '/jobs';
  static const String jobDetail = '/jobs/:id';
  static const String apply = '/apply/:id';
  static const String profile = '/profile';
  static const String profileApplications = '/profile/applications';
  static const String profileSavedJobs = '/profile/saved-jobs';
  static const String settings = '/profile/settings';
}

/// Router provider with auth state and theme support
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  final settings = ref.watch(settingsProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: RouterRefreshNotifier(ref),
    redirect: (context, state) {
      final isLoggedIn = authState.maybeWhen(
        authenticated: (_) => true,
        orElse: () => false,
      );

      final isPublicRoute = _isPublicRoute(state.matchedLocation);

      // Handle Splash screen
      if (state.matchedLocation == AppRoutes.splash) {
        return authState.maybeWhen(
          initial: () => null,
          loading: () => null,
          authenticated: (_) => AppRoutes.jobs,
          unauthenticated: () => AppRoutes.login,
          error: (_) => AppRoutes.login,
          orElse: () => AppRoutes.login,
        );
      }

      // If not logged in and trying to access protected route
      if (!isLoggedIn && !isPublicRoute) {
        return AppRoutes.login;
      }

      // If logged in and trying to access login/register
      if (isLoggedIn && (state.matchedLocation == AppRoutes.login || state.matchedLocation == AppRoutes.register)) {
        return AppRoutes.jobs;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: AppRoutes.jobs,
        name: 'jobs',
        builder: (context, state) => const JobsListPage(),
        routes: [
          GoRoute(
            path: ':id',
            name: 'jobDetail',
            builder: (context, state) {
              final jobId = state.pathParameters['id']!;
              return JobDetailPage(jobId: jobId);
            },
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.apply,
        name: 'apply',
        builder: (context, state) {
          final jobId = state.pathParameters['id']!;
          return ApplyPage(jobId: jobId);
        },
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.profile,
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
            routes: [
              GoRoute(
                path: 'applications',
                name: 'profileApplications',
                builder: (context, state) => const _ApplicationsPlaceholder(),
              ),
              GoRoute(
                path: 'saved-jobs',
                name: 'profileSavedJobs',
                builder: (context, state) => const _SavedJobsPlaceholder(),
              ),
              GoRoute(
                path: 'settings',
                name: 'settings',
                builder: (context, state) => const SettingsPage(),
              ),
            ],
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
});

/// Placeholder for Applications page (to be implemented)
class _ApplicationsPlaceholder extends StatelessWidget {
  const _ApplicationsPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
      ),
      body: const Center(
        child: Text('Applications page - coming soon'),
      ),
    );
  }
}

/// Placeholder for Saved Jobs page (to be implemented)
class _SavedJobsPlaceholder extends StatelessWidget {
  const _SavedJobsPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Jobs'),
      ),
      body: const Center(
        child: Text('Saved Jobs page - coming soon'),
      ),
    );
  }
}

bool _isPublicRoute(String location) {
  final publicRoutes = [
    AppRoutes.splash,
    AppRoutes.login,
    AppRoutes.register,
  ];

  return publicRoutes.contains(location);
}

/// Helper to refresh router when auth state changes
class RouterRefreshNotifier extends ChangeNotifier {
  RouterRefreshNotifier(Ref ref) {
    ref.listen(authStateProvider, (_, __) => notifyListeners());
  }
}

/// Splash screen shown on app start
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.work,
                size: 80,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Smart Job',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'AI-Powered Job Matching',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  ),
            ),
            const SizedBox(height: 48),
            authState.maybeWhen(
              error: (message) => Column(
                children: [
                  Text(
                    'Error: $message',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => ref.read(authStateProvider.notifier).checkAuthStatus(),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
              orElse: () => const LoadingWidget(message: 'Loading...'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Error screen for route errors
class ErrorScreen extends StatelessWidget {
  final GoException? error;

  const ErrorScreen({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 60,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              error?.message ?? 'Page not found',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go(AppRoutes.jobs),
              icon: const Icon(Icons.home),
              label: const Text('Go to Jobs'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Main shell with bottom navigation
class MainShell extends StatelessWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateSelectedIndex(context),
        onDestinationSelected: (index) => _onItemTapped(index, context),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.work_outline),
            selectedIcon: Icon(Icons.work),
            label: 'Jobs',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/profile')) return 1;
    return 0;
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go(AppRoutes.jobs);
        break;
      case 1:
        context.go(AppRoutes.profile);
        break;
    }
  }
}