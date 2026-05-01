import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:get_it/get_it.dart';

import '../../domain/entities/user.dart';
import '../../domain/models/auth_models.dart';
import '../../domain/repositories/auth_repository.dart';

part 'auth_provider.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.error(String message) = _Error;
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return GetIt.I<AuthRepository>();
});

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthNotifier(this._authRepository) : super(const AuthState.initial()) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    state = const AuthState.loading();
    final result = await _authRepository.getCurrentUser();
    result.when(
      success: (user, _, __) {
        state = AuthState.authenticated(user);
      },
      failure: (failure, _) {
        state = const AuthState.unauthenticated();
      },
      loading: () => state = const AuthState.loading(),
      initial: () => state = const AuthState.initial(),
    );
  }

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    final result = await _authRepository.login(LoginRequest(email: email, password: password));
    result.when(
      success: (authResult, _, __) {
        state = AuthState.authenticated(authResult.user);
      },
      failure: (failure, _) {
        state = AuthState.error(failure.message);
      },
      loading: () => state = const AuthState.loading(),
      initial: () => state = const AuthState.initial(),
    );
  }

  Future<void> register(RegisterRequest request) async {
    state = const AuthState.loading();
    final result = await _authRepository.register(request);
    result.when(
      success: (authResult, _, __) {
        state = AuthState.authenticated(authResult.user);
      },
      failure: (failure, _) {
        state = AuthState.error(failure.message);
      },
      loading: () => state = const AuthState.loading(),
      initial: () => state = const AuthState.initial(),
    );
  }

  Future<void> logout() async {
    state = const AuthState.loading();
    await _authRepository.logout();
    state = const AuthState.unauthenticated();
  }

  Future<bool> refreshToken() async {
    return await _authRepository.refreshToken();
  }
}

final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.maybeWhen(
    authenticated: (user) => user,
    orElse: () => null,
  );
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.maybeWhen(
    authenticated: (_) => true,
    orElse: () => false,
  );
});
