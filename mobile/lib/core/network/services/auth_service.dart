import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';

import '../../shared/models/user_model.dart';
import '../api_client.dart';

/// Authentication service for login, registration, and user management
@lazySingleton
class AuthService {
  final ApiClient _apiClient;

  AuthService({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Login with email and password
  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    final data = response.data['data'];
    
    // Save tokens for future requests
    await _apiClient.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );

    return UserModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  /// Register a new user
  Future<UserModel> register({
    required String email,
    required String password,
    required String fullName,
    required String role,
    String? phone,
  }) async {
    final response = await _apiClient.dio.post(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        'fullName': fullName,
        'role': role,
        if (phone != null) 'phone': phone,
      },
    );

    final data = response.data['data'];
    
    // Save tokens for future requests
    await _apiClient.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );

    return UserModel.fromJson(data['user'] as Map<String, dynamic>);
  }

  /// Logout the current user
  Future<void> logout() async {
    try {
      await _apiClient.dio.post('/auth/logout');
    } finally {
      await _apiClient.clearAuthTokens();
    }
  }

  /// Get the current authenticated user
  Future<UserModel> getCurrentUser() async {
    final response = await _apiClient.dio.get('/auth/me');
    return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Refresh the access token
  Future<void> refreshToken() async {
    // Token refresh is handled by AuthInterceptor automatically
    await _apiClient.dio.post('/auth/refresh');
  }

  /// Request password reset
  Future<void> forgotPassword({required String email}) async {
    await _apiClient.dio.post(
      '/auth/forgot-password',
      data: {'email': email},
    );
  }

  /// Reset password with token
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    await _apiClient.dio.post(
      '/auth/reset-password',
      data: {
        'token': token,
        'newPassword': newPassword,
      },
    );
  }

  /// Verify email with token
  Future<void> verifyEmail({required String token}) async {
    await _apiClient.dio.post(
      '/auth/verify-email',
      data: {'token': token},
    );
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() => _apiClient.isAuthenticated();
}