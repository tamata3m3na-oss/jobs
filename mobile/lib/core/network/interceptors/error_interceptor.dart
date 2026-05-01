import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';

import '../error/exceptions.dart';

/// Error interceptor for handling API errors globally
@injectable
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final AppException appException = _mapDioError(err);
    return handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        error: appException,
        type: err.type,
      ),
    );
  }

  AppException _mapDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const NetworkException(
          message: 'Connection failed. Please check your internet connection.',
          code: 'NETWORK_ERROR',
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error);

      case DioExceptionType.cancel:
        return const NetworkException(
          message: 'Request was cancelled.',
          code: 'REQUEST_CANCELLED',
        );

      case DioExceptionType.unknown:
      default:
        if (error.error is AppException) {
          return error.error as AppException;
        }
        return NetworkException(
          message: error.message ?? 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
          originalError: error,
        );
    }
  }

  AppException _handleBadResponse(DioException error) {
    final statusCode = error.response?.statusCode;
    final responseData = error.response?.data;
    String message = 'Server error occurred';
    String code = 'SERVER_ERROR';
    Map<String, String>? fieldErrors;

    if (responseData is Map<String, dynamic>) {
      message = responseData['message'] as String? ?? responseData['error'] as String? ?? message;
      code = responseData['code'] as String? ?? code;

      // Extract field validation errors
      if (responseData['errors'] != null) {
        fieldErrors = (responseData['errors'] as Map<String, dynamic>).map(
          (key, value) => MapEntry(key, value.toString()),
        );
      }
    }

    switch (statusCode) {
      case 400:
        return ValidationException(
          message: message,
          code: code,
          fieldErrors: fieldErrors,
        );
      case 401:
        return const AuthException(
          message: 'Authentication required. Please login again.',
          code: 'UNAUTHORIZED',
        );
      case 403:
        return const AuthException(
          message: 'You do not have permission to access this resource.',
          code: 'FORBIDDEN',
        );
      case 404:
        return const ServerException(
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          statusCode: 404,
        );
      case 422:
        return ValidationException(
          message: message,
          code: code,
          fieldErrors: fieldErrors,
        );
      case 429:
        return const ServerException(
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
          statusCode: 429,
        );
      case 500:
      case 502:
      case 503:
        return ServerException(
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          statusCode: statusCode,
        );
      default:
        return ServerException(
          message: message,
          code: code,
          statusCode: statusCode,
        );
    }
  }
}