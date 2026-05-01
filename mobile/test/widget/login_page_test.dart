import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartjob/features/auth/presentation/pages/login_page.dart';
import 'package:smartjob/core/router/app_router.dart';
import 'package:smartjob/core/di/injection.dart';

void main() {
  setUpAll(() {
    // Initialize dependency injection for tests
    if (!getIt.isRegistered<AuthRepository>()) {
      getIt.registerLazySingleton<AuthRepository>(() => MockAuthRepository());
    }
  });

  group('LoginPage Widget Tests', () {
    testWidgets('should display email and password fields', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      // Find email field
      expect(find.widgetWithText(TextFormField, 'Email'), findsOneWidget);
      
      // Find password field
      expect(find.widgetWithText(TextFormField, 'Password'), findsOneWidget);
    });

    testWidgets('should display login button', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      expect(find.text('Login'), findsOneWidget);
    });

    testWidgets('should display register link', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      expect(find.text("Don't have an account? "), findsOneWidget);
      expect(find.text('Register'), findsOneWidget);
    });

    testWidgets('should display app logo and title', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      expect(find.text('Smart Job'), findsOneWidget);
      expect(find.text('Find your dream job'), findsOneWidget);
    });

    testWidgets('should show validation error for empty email', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      // Find and tap login button without entering email
      await tester.tap(find.text('Login'));
      await tester.pump();

      expect(find.text('Email is required'), findsOneWidget);
    });

    testWidgets('should show validation error for invalid email', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      // Enter invalid email
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email'),
        'invalidemail',
      );
      await tester.tap(find.text('Login'));
      await tester.pump();

      expect(find.text('Invalid email address'), findsOneWidget);
    });

    testWidgets('should show validation error for short password', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      // Enter valid email but short password
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Email'),
        'test@example.com',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Password'),
        '123',
      );
      await tester.tap(find.text('Login'));
      await tester.pump();

      expect(find.text('Password must be at least 6 characters'), findsOneWidget);
    });

    testWidgets('should toggle password visibility', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      // Find visibility toggle button
      final toggleButton = find.byIcon(Icons.visibility_outlined);
      expect(toggleButton, findsOneWidget);

      // Tap to show password
      await tester.tap(toggleButton);
      await tester.pump();

      // Should now show visibility_off icon
      expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
    });

    testWidgets('should display remember me checkbox', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      expect(find.text('Remember me'), findsOneWidget);
      expect(find.byType(Checkbox), findsOneWidget);
    });

    testWidgets('should display forgot password button', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: LoginPage(),
          ),
        ),
      );

      expect(find.text('Forgot Password?'), findsOneWidget);
    });
  });
}

class MockAuthRepository implements AuthRepository {
  @override
  Future<ApiResult<AuthResponse>> login(LoginRequest request) async {
    return ApiResult.success(
      data: AuthResponse(
        user: User(
          id: '1',
          email: 'test@example.com',
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