import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/loading_widget.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/auth/presentation/providers/auth_provider.dart';
import '../features/jobs/presentation/pages/job_detail_page.dart';
import '../features/jobs/presentation/pages/jobs_list_page.dart';
import '../features/jobs/presentation/pages/apply_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/profile/presentation/pages/settings_page.dart';

/// Route names for type-safe navigation
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String jobs = '/jobs';
  static const String jobDetail = '/jobs/:id';
  static const String apply = '/apply/:id';
  static const String profile = '/profile';
  static const String settings = '/profile/settings';
}

/// Router provider with auth state
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: _RouterRefreshNotifier(authState),
    redirect: (context, state) {
      final isLoggedIn = authState.maybeMap(
        authenticated: (_) => true,
        orElse: () => false,
      );

      final isPublicRoute = _isPublicRoute(state.matchedLocation);

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

bool _isPublicRoute(String location) {
  final publicRoutes = [
    AppRoutes.splash,
    AppRoutes.login,
    AppRoutes.register,
  ];

  return publicRoutes.contains(location);
}

/// Helper to refresh router when auth state changes
class _RouterRefreshNotifier extends ChangeNotifier {
  _RouterRefreshNotifier(this.authState) {
    authState.maybeWhen(
      data: (state) => state.when(
        authenticated: (_) {},
        unauthenticated: () {},
        loading: () {},
      ),
      orElse: () {},
    );
  }

  final AsyncValue<AuthState> authState;

  @override
  void dispose() {
    authState.whenData((_) {}).maybeWhen(
          orElse: () {},
        );
    super.dispose();
  }
}

/// Splash screen shown on app start
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return authState.when(
      data: (state) {
        // Redirect handled by router redirect
        return const Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.work, size: 80, color: Colors.blue),
                SizedBox(height: 24),
                Text(
                  'Smart Job',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 16),
                LoadingWidget(),
              ],
            ),
          ),
        );
      },
      loading: () => const Scaffold(
        body: Center(child: LoadingWidget()),
      ),
      error: (error, stack) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 60, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go(AppRoutes.login),
                child: const Text('Go to Login'),
              ),
            ],
          ),
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
            const Icon(Icons.error_outline, size: 60, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              error?.message ?? 'Page not found',
              style: const TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.jobs),
              child: const Text('Go to Jobs'),
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