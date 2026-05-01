import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:injectable/injectable.dart';

import '../error/exceptions.dart';

/// Authentication interceptor for attaching tokens to requests
@injectable
class AuthInterceptor extends Interceptor {
  final FlutterSecureStorage _secureStorage;
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  AuthInterceptor({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip auth header for login/register endpoints
    if (_isPublicEndpoint(options.path)) {
      return handler.next(options);
    }

    try {
      final accessToken = await _secureStorage.read(key: _accessTokenKey);
      if (accessToken != null && accessToken.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
    } catch (e) {
      // Continue without token if storage read fails
    }

    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Handle 401 errors by attempting token refresh
    if (err.response?.statusCode == 401 && !_isPublicEndpoint(err.requestOptions.path)) {
      try {
        final refreshed = await _refreshToken();
        if (refreshed) {
          // Retry the original request
          final retryResponse = await _retryRequest(err.requestOptions);
          return handler.resolve(retryResponse);
        }
      } catch (e) {
        // Clear tokens and redirect to login
        await clearTokens();
      }
    }

    return handler.next(err);
  }

  bool _isPublicEndpoint(String path) {
    final publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];

    return publicEndpoints.any((endpoint) => path.contains(endpoint));
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _secureStorage.read(key: _refreshTokenKey);
      if (refreshToken == null || refreshToken.isEmpty) {
        return false;
      }

      final dio = Dio(BaseOptions(
        baseUrl: 'http://api.smartjob.com/api/v1',
      ));

      final response = await dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data['data'];
        await _secureStorage.write(
          key: _accessTokenKey,
          value: data['accessToken'],
        );
        await _secureStorage.write(
          key: _refreshTokenKey,
          value: data['refreshToken'],
        );
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  Future<Response<dynamic>> _retryRequest(RequestOptions options) async {
    final accessToken = await _secureStorage.read(key: _accessTokenKey);
    final opts = Options(
      method: options.method,
      headers: {
        ...options.headers,
        'Authorization': 'Bearer $accessToken',
      },
    );

    final dio = Dio();
    return dio.request<dynamic>(
      options.baseUrl + options.path,
      data: options.data,
      queryParameters: options.queryParameters,
      options: opts,
    );
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.write(key: _accessTokenKey, value: accessToken);
    await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<void> clearTokens() async {
    await _secureStorage.delete(key: _accessTokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
  }

  Future<String?> getAccessToken() async {
    return _secureStorage.read(key: _accessTokenKey);
  }

  Future<bool> hasValidToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}