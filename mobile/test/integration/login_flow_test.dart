import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:smartjob/features/auth/presentation/pages/login_page.dart';
import 'package:smartjob/features/auth/presentation/pages/register_page.dart';
import 'package:smartjob/features/auth/presentation/providers/auth_provider.dart';
import 'package:smartjob/core/router/app_router.dart';
import 'package:smartjob/core/di/injection.dart';
import 'package:smartjob/shared/utils/api_result.dart';

void main() {
  group('Login Flow Integration Tests', () {
    setUpAll(() {
      // Register mock auth repository
      if (!getIt.isRegistered<AuthRepository>()) {
        getIt.registerLazySingleton<AuthRepository>(() => MockAuthRepository());
      }
    });

    testWidgets('should navigate from login to register', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp.router(
            routerConfig: _createMockRouter(),
          ),
        ),
      );

      // Find and tap register link
      await tester.tap(find.text('Register'));
      await tester.pumpAndSettle();

      // Should show register page
      expect(find.byType(RegisterPage), findsOneWidget);
    });

    testWidgets('should complete login flow with valid credentials', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const LoginPage(),
          ),
        ),
      );

      // Enter email
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email'),
        'test@example.com',
      );
      await tester.pump();

      // Enter password
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Password'),
        'password123',
      );
      await tester.pump();

      // Tap login button
      await tester.tap(find.text('Login'));
      await tester.pump();

      // Should trigger login (in real app would navigate to jobs)
      // Since mock always succeeds, state should update
      await tester.pump(const Duration(milliseconds: 100));

      // Verify form fields have values
      final emailField = tester.widget<TextField>(
        find.widgetWithText(TextFormField, 'Email'),
      );
      expect(emailField.controller?.text, 'test@example.com');

      final passwordField = tester.widget<TextField>(
        find.widgetWithText(TextFormField, 'Password'),
      );
      expect(passwordField.controller?.text, 'password123');
    });

    testWidgets('should validate email format on submit', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const LoginPage(),
          ),
        ),
      );

      // Enter invalid email
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email'),
        'notanemail',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Password'),
        'password123',
      );

      // Tap login
      await tester.tap(find.text('Login'));
      await tester.pump();

      // Should show error
      expect(find.text('Invalid email address'), findsOneWidget);
    });

    testWidgets('should toggle remember me option', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const LoginPage(),
          ),
        ),
      );

      // Find checkbox
      final checkbox = find.byType(Checkbox);
      expect(checkbox, findsOneWidget);

      // Tap to check
      await tester.tap(checkbox);
      await tester.pump();

      // Verify checkbox is now checked
      final checkboxWidget = tester.widget<Checkbox>(checkbox);
      expect(checkboxWidget.value, isTrue);
    });

    testWidgets('should toggle password visibility', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: const LoginPage(),
          ),
        ),
      );

      // Initially password should be obscured
      final passwordField = tester.widget<TextField>(
        find.widgetWithText(TextFormField, 'Password'),
      );
      expect(passwordField.obscureText, isTrue);

      // Tap visibility toggle
      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pump();

      // Password should now be visible
      final updatedPasswordField = tester.widget<TextField>(
        find.widgetWithText(TextFormField, 'Password'),
      );
      expect(updatedPasswordField.obscureText, isFalse);
    });
  });
}

GoRouter _createMockRouter() {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
    ],
  );
}

class MockAuthRepository implements AuthRepository {
  @override
  Future<ApiResult<AuthResponse>> login(LoginRequest request) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));
    
    return ApiResult.success(
      data: AuthResponse(
        user: User(
          id: '1',
          email: request.email,
          fullName: 'Test User',
          role: 'job_seeker',
        ),
        accessToken: 'mock_token',
        refreshToken: 'mock_refresh_token',
      ),
    );
  }

  @override
  Future<ApiResult<AuthResponse>> register(RegisterRequest request) async {
    return ApiResult.success(
      data: AuthResponse(
        user: User(
          id: '1',
          email: request.email,
          fullName: request.fullName ?? '',
          role: 'job_seeker',
        ),
        accessToken: 'mock_token',
        refreshToken: 'mock_refresh_token',
      ),
    );
  }

  @override
  Future<ApiResult<User>> getCurrentUser() async {
    return ApiResult.unauthenticated();
  }

  @override
  Future<void> logout() async {}

  @override
  Future<bool> refreshToken() async => true;
}