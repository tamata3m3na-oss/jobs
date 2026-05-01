import 'package:dio/dio.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../core/error/failures.dart';

part 'api_result.freezed.dart';

/// Sealed class representing API operation results
/// Uses Freezed for exhaustive pattern matching and immutability
@freezed
class ApiResult<T> with _$ApiResult<T> {
  /// Success state with data
  const factory ApiResult.success({
    required T data,
    String? message,
    int? statusCode,
  }) = ApiSuccess<T>;

  /// Failure state with error information
  const factory ApiResult.failure({
    required Failure failure,
    int? statusCode,
  }) = ApiFailure<T>;

  /// Loading state
  const factory ApiResult.loading() = ApiLoading<T>;

  /// Initial state
  const factory ApiResult.initial() = ApiInitial<T>;

  const ApiResult._();

  /// Pattern matching helper using `when`
  R when<R>({
    required R Function(T data, String? message, int? statusCode) success,
    required R Function(Failure failure, int? statusCode) failure,
    required R Function() loading,
    required R Function() initial,
  }) {
    return fold(
      success: (data, message, statusCode) => success(data, message, statusCode),
      failure: (failure, statusCode) => failure(failure, statusCode),
      loading: () => loading(),
      initial: () => initial(),
    );
  }

  /// Pattern matching helper using `maybeWhen` (allows omitting cases)
  R maybeWhen<R>({
    R Function(T data, String? message, int? statusCode)? success,
    R Function(Failure failure, int? statusCode)? failure,
    R Function()? loading,
    R Function()? initial,
    required R Function() orElse,
  }) {
    return maybeFold(
      success: success != null
          ? (data, message, statusCode) => success(data, message, statusCode)
          : null,
      failure: failure != null
          ? (failure, statusCode) => failure(failure, statusCode)
          : null,
      loading: loading,
      initial: initial,
      orElse: orElse,
    );
  }

  /// Fold helper that doesn't require exhaustive matching
  R fold<R>({
    R Function(T data, String? message, int? statusCode)? success,
    R Function(Failure failure, int? statusCode)? failure,
    R Function()? loading,
    R Function()? initial,
    required R Function() orElse,
  }) {
    return when(
      success: (data, message, statusCode) =>
          success?.call(data, message, statusCode) ?? orElse(),
      failure: (failure, statusCode) =>
          failure?.call(failure, statusCode) ?? orElse(),
      loading: () => loading?.call() ?? orElse(),
      initial: () => initial?.call() ?? orElse(),
    );
  }

  /// Maybe fold helper
  R maybeFold<R>({
    R Function(T data, String? message, int? statusCode)? success,
    R Function(Failure failure, int? statusCode)? failure,
    R Function()? loading,
    R Function()? initial,
    required R Function() orElse,
  }) {
    if (this is ApiSuccess<T>) {
      final s = this as ApiSuccess<T>;
      return success?.call(s.data, s.message, s.statusCode) ?? orElse();
    }
    if (this is ApiFailure<T>) {
      final f = this as ApiFailure<T>;
      return failure?.call(f.failure, f.statusCode) ?? orElse();
    }
    if (this is ApiLoading<T>) {
      return loading?.call() ?? orElse();
    }
    if (this is ApiInitial<T>) {
      return initial?.call() ?? orElse();
    }
    return orElse();
  }

  /// Check if result is success
  bool get isSuccess => this is ApiSuccess<T>;

  /// Check if result is failure
  bool get isFailure => this is ApiFailure<T>;

  /// Check if result is loading
  bool get isLoading => this is ApiLoading<T>;

  /// Check if result is initial
  bool get isInitial => this is ApiInitial<T>;

  /// Get data if success, otherwise null
  T? get dataOrNull {
    return maybeWhen(success: (data, _, __) => data, orElse: () => null);
  }

  /// Get failure if failure, otherwise null
  Failure? get failureOrNull {
    return maybeWhen(failure: (failure, _) => failure, orElse: () => null);
  }

  /// Get data or throw exception
  T get dataOrThrow {
    if (isSuccess) {
      return (this as ApiSuccess<T>).data;
    }
    throw Exception('ApiResult is not a success. Actual type: $runtimeType');
  }

  /// Get data or default value
  T getOrElse(T defaultValue) {
    return dataOrNull ?? defaultValue;
  }

  /// Map the data type
  ApiResult<R> map<R>(R Function(T data) mapper) {
    return when(
      success: (data, message, statusCode) => ApiResult.success(
        data: mapper(data),
        message: message,
        statusCode: statusCode,
      ),
      failure: (failure, statusCode) => ApiResult.failure(
        failure: failure,
        statusCode: statusCode,
      ),
      loading: () => const ApiResult.loading(),
      initial: () => const ApiResult.initial(),
    );
  }

  /// Map the failure type
  ApiResult<T> mapFailure(ApiResult<T> Function(Failure failure) mapper) {
    return when(
      success: (data, message, statusCode) => ApiResult.success(
        data: data,
        message: message,
        statusCode: statusCode,
      ),
      failure: (failure, statusCode) => mapper(failure),
      loading: () => const ApiResult.loading(),
      initial: () => const ApiResult.initial(),
    );
  }
}

/// Extension methods for Dio Response conversion
extension DioResponseX on Response {
  /// Convert Dio response to ApiSuccess
  ApiResult<T> toApiSuccess<T>(T Function(dynamic data) mapper) {
    return ApiResult.success(
      data: mapper(data),
      message: statusMessage,
      statusCode: statusCode,
    );
  }
}

/// Extension methods for Dio error conversion
extension DioErrorX on DioException {
  /// Convert DioException to Failure
  Failure toFailure() {
    switch (type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const TimeoutFailure(
          message: 'Connection timed out. Please try again.',
          code: 'TIMEOUT',
        );
      case DioExceptionType.connectionError:
        return const NetworkFailure(
          message: 'No internet connection. Please check your network.',
          code: 'NETWORK_ERROR',
        );
      case DioExceptionType.badResponse:
        return _handleBadResponse();
      case DioExceptionType.cancel:
        return const Failure(
          message: 'Request was cancelled',
          code: 'CANCELLED',
        );
      case DioExceptionType.badCertificate:
        return const Failure(
          message: 'Security certificate error',
          code: 'CERTIFICATE_ERROR',
        );
      case DioExceptionType.unknown:
      default:
        return const UnknownFailure(
          message: 'An unexpected error occurred',
          code: 'UNKNOWN',
        );
    }
  }

  Failure _handleBadResponse() {
    final statusCode = response?.statusCode ?? 500;
    final data = response?.data;
    String? message;
    String? code;

    if (data is Map<String, dynamic>) {
      message = data['message'] as String? ??
          data['error'] as String? ??
          'Server error occurred';
      code = data['code'] as String? ??
          data['errorCode'] as String? ??
          _statusCodeToErrorCode(statusCode);
    } else {
      message = 'Server error occurred';
      code = _statusCodeToErrorCode(statusCode);
    }

    if (statusCode == 401) {
      return AuthFailure(message: message, code: code);
    }
    if (statusCode == 403) {
      return AuthFailure(message: 'Access denied', code: code);
    }
    if (statusCode == 404) {
      return NotFoundFailure(message: message, code: code);
    }
    if (statusCode >= 400 && statusCode < 500) {
      return ValidationFailure(message: message, code: code);
    }
    if (statusCode >= 500) {
      return ServerFailure(
        message: message,
        code: code,
        statusCode: statusCode,
      );
    }

    return ServerFailure(
      message: message,
      code: code,
      statusCode: statusCode,
    );
  }

  String _statusCodeToErrorCode(int statusCode) {
    return 'HTTP_$statusCode';
  }
}

/// Extension methods for converting failures to ApiResult
extension FailureX on Failure {
  /// Convert Failure to ApiFailure
  ApiResult<T> toApiResult<T>({int? statusCode}) {
    return ApiResult.failure(
      failure: this,
      statusCode: statusCode,
    );
  }
}

/// Extension for optional nullable ApiResult operations
extension NullableApiResultX<T> on ApiResult<T?> {
  /// Unwrap nullable result, treating null data as a failure if specified
  ApiResult<T> unwrapNullable({String? message}) {
    return when(
      success: (data, m, s) {
        if (data == null) {
          return ApiResult.failure(
            failure: NotFoundFailure(
              message: message ?? 'Resource not found',
              code: 'NOT_FOUND',
            ),
            statusCode: s,
          );
        }
        return ApiResult.success(data: data, message: m, statusCode: s);
      },
      failure: (failure, statusCode) => ApiResult.failure(
        failure: failure,
        statusCode: statusCode,
      ),
      loading: () => const ApiResult.loading(),
      initial: () => const ApiResult.initial(),
    );
  }
}
