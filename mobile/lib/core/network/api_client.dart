import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:injectable/injectable.dart';

import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/logging_interceptor.dart';

/// API client configuration for network requests
/// Configures Dio with base URL, interceptors, and retry logic
@lazySingleton
class ApiClient {
  final AuthInterceptor _authInterceptor;
  final LoggingInterceptor _loggingInterceptor;
  final ErrorInterceptor _errorInterceptor;

  late final Dio _dio;

  ApiClient({
    required AuthInterceptor authInterceptor,
    required LoggingInterceptor loggingInterceptor,
    required ErrorInterceptor errorInterceptor,
  })  : _authInterceptor = authInterceptor,
        _loggingInterceptor = loggingInterceptor,
        _errorInterceptor = errorInterceptor {
    _dio = _createDio();
  }

  Dio get dio => _dio;

  /// Base URL for the API - can be overridden for testing
  static const String _defaultBaseUrl = 'http://api.smartjob.com/api/v1';

  /// Maximum retry attempts
  static const int _maxRetries = 3;

  /// Initial retry delay in milliseconds
  static const int _initialRetryDelay = 1000;

  Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: _defaultBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        headers: {
          HttpHeaders.contentTypeHeader: 'application/json',
          HttpHeaders.acceptHeader: 'application/json',
          'X-App-Version': '1.0.0',
          'X-Platform': 'mobile',
        },
      ),
    );

    // Add interceptors
    dio.interceptors.add(_authInterceptor);
    if (kDebugMode) {
      dio.interceptors.add(_loggingInterceptor);
    }
    dio.interceptors.add(_errorInterceptor);

    // Add retry interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onError: _retryInterceptor,
      ),
    );

    return dio;
  }

  /// Retry interceptor with exponential backoff
  Future<void> _retryInterceptor(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    // Only retry on specific error types
    if (!_shouldRetry(error)) {
      return handler.next(error);
    }

    final extra = error.requestOptions.extra;
    final retryCount = extra['retryCount'] as int? ?? 0;

    if (retryCount >= _maxRetries) {
      return handler.next(error);
    }

    // Calculate delay with exponential backoff
    final delay = _initialRetryDelay * (2 << retryCount);
    await Future.delayed(Duration(milliseconds: delay));

    // Update retry count
    error.requestOptions.extra['retryCount'] = retryCount + 1;

    try {
      // Retry the request
      final response = await _dio.fetch(error.requestOptions);
      return handler.resolve(response);
    } catch (e) {
      return handler.next(error);
    }
  }

  bool _shouldRetry(DioException error) {
    // Retry on connection errors and timeouts
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return true;
    }

    // Retry on 5xx server errors
    final statusCode = error.response?.statusCode;
    if (statusCode != null && statusCode >= 500) {
      return true;
    }

    // Retry on network errors
    if (error.type == DioExceptionType.connectionError) {
      return true;
    }

    return false;
  }

  /// Update base URL (useful for testing or switching environments)
  void updateBaseUrl(String baseUrl) {
    _dio.options.baseUrl = baseUrl;
  }

  /// Clear auth tokens
  Future<void> clearAuthTokens() => _authInterceptor.clearTokens();

  /// Check if user is authenticated
  Future<bool> isAuthenticated() => _authInterceptor.hasValidToken();

  /// Save auth tokens
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) =>
      _authInterceptor.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
}