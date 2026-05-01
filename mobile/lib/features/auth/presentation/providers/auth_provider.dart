import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/services/auth_service.dart';
import '../../../../shared/models/user_model.dart';

/// Authentication status enum
enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

/// Authentication state data
class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
  });

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
  bool get hasError => status == AuthStatus.error;

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

/// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(apiClient: apiClientProvider());
});

/// Main auth state provider
final authStateProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<AuthState>>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

/// Auth state notifier for managing authentication
class AuthNotifier extends StateNotifier<AsyncValue<AuthState>> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AsyncValue.data(AuthState())) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    state = const AsyncValue.loading();
    try {
      final isAuth = await _authService.isAuthenticated();
      if (isAuth) {
        final user = await _authService.getCurrentUser();
        state = AsyncValue.data(AuthState(
          status: AuthStatus.authenticated,
          user: user,
        ));
      } else {
        state = const AsyncValue.data(AuthState(status: AuthStatus.unauthenticated));
      }
    } catch (e) {
      state = AsyncValue.data(AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.login(email: email, password: password);
      state = AsyncValue.data(AuthState(
        status: AuthStatus.authenticated,
        user: user,
      ));
    } catch (e) {
      state = AsyncValue.data(AuthState(
        status: AuthStatus.error,
        errorMessage: _formatError(e),
      ));
    }
  }

  Future<void> register({
    required String email,
    required String password,
    required String fullName,
    required String role,
    String? phone,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.register(
        email: email,
        password: password,
        fullName: fullName,
        role: role,
        phone: phone,
      );
      state = AsyncValue.data(AuthState(
        status: AuthStatus.authenticated,
        user: user,
      ));
    } catch (e) {
      state = AsyncValue.data(AuthState(
        status: AuthStatus.error,
        errorMessage: _formatError(e),
      ));
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    try {
      await _authService.logout();
      state = const AsyncValue.data(AuthState(status: AuthStatus.unauthenticated));
    } catch (e) {
      state = const AsyncValue.data(AuthState(status: AuthStatus.unauthenticated));
    }
  }

  Future<void> refreshUser() async {
    try {
      final user = await _authService.getCurrentUser();
      state = AsyncValue.data(AuthState(
        status: AuthStatus.authenticated,
        user: user,
      ));
    } catch (_) {
      // Keep current state if refresh fails
    }
  }

  String _formatError(dynamic error) {
    final errorStr = error.toString();
    if (errorStr.contains('401')) {
      return 'Invalid email or password';
    }
    if (errorStr.contains('network')) {
      return 'Network error. Please check your connection.';
    }
    return errorStr;
  }
}

/// Current user provider (convenience accessor)
final currentUserProvider = Provider<UserModel?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.maybeWhen(
    data: (state) => state.user,
    orElse: () => null,
  );
});

/// Auth status provider (convenience accessor)
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.maybeWhen(
    data: (state) => state.isAuthenticated,
    orElse: () => false,
  );
});