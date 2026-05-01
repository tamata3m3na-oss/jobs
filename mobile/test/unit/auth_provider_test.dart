import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:smartjob/features/auth/presentation/providers/auth_provider.dart';
import 'package:smartjob/features/auth/domain/models/auth_models.dart';
import 'package:smartjob/shared/utils/api_result.dart';
import 'package:smartjob/core/error/failures.dart';

import 'package:smartjob/core/di/injection.dart';

void main() {
  group('AuthProvider Tests', () {
    setUpAll(() {
      getIt.registerLazySingleton<AuthRepository>(() => MockAuthRepository());
    });

    tearDownAll(() {
      getIt.reset();
    });

    test('Initial state should be AuthState.initial()', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final authState = container.read(authStateProvider);
      expect(authState, isA<AuthState.initial>());
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