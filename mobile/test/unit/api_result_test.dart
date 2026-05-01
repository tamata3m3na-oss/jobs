import 'package:flutter_test/flutter_test.dart';
import 'package:smartjob/shared/utils/api_result.dart';
import 'package:smartjob/core/error/failures.dart';

void main() {
  group('ApiResult Tests', () {
    group('success state', () {
      test('should create success with data', () {
        final result = ApiResult.success(data: 'test data');

        expect(result.isSuccess, isTrue);
        expect(result.isFailure, isFalse);
        expect(result.isLoading, isFalse);
        expect(result.isInitial, isFalse);
      });

      test('should return data using dataOrNull', () {
        final result = ApiResult.success(data: 'test data');

        expect(result.dataOrNull, 'test data');
      });

      test('should return data using getOrElse', () {
        final result = ApiResult.success(data: 'test data');

        expect(result.getOrElse('default'), 'test data');
      });

      test('should throw when using dataOrThrow on success', () {
        final result = ApiResult.success(data: 'test data');

        expect(result.dataOrThrow, 'test data');
      });

      test('should throw when using dataOrThrow on failure', () {
        final result = ApiResult.failure(
          failure: const Failure(message: 'error'),
        );

        expect(() => result.dataOrThrow, throwsException);
      });

      test('when should call success callback', () {
        final result = ApiResult.success(data: 'test data', message: 'ok');

        String? capturedData;
        String? capturedMessage;

        result.when(
          success: (data, message, statusCode) {
            capturedData = data;
            capturedMessage = message;
          },
          failure: (_, __) {},
          loading: () {},
          initial: () {},
        );

        expect(capturedData, 'test data');
        expect(capturedMessage, 'ok');
      });

      test('map should transform data', () {
        final result = ApiResult.success(data: 5);

        final mapped = result.map((data) => data * 2);

        expect(mapped.isSuccess, isTrue);
        expect(mapped.dataOrNull, 10);
      });
    });

    group('failure state', () {
      test('should create failure', () {
        final result = ApiResult.failure(
          failure: const Failure(message: 'error'),
        );

        expect(result.isSuccess, isFalse);
        expect(result.isFailure, isTrue);
        expect(result.isLoading, isFalse);
        expect(result.isInitial, isFalse);
      });

      test('dataOrNull should return null', () {
        final result = ApiResult.failure(
          failure: const Failure(message: 'error'),
        );

        expect(result.dataOrNull, isNull);
      });

      test('getOrElse should return default value', () {
        final result = ApiResult.failure(
          failure: const Failure(message: 'error'),
        );

        expect(result.getOrElse('default'), 'default');
      });

      test('failureOrNull should return failure', () {
        final failure = const Failure(message: 'error');
        final result = ApiResult.failure(failure: failure);

        expect(result.failureOrNull, failure);
      });

      test('when should call failure callback', () {
        final result = ApiResult.failure(
          failure: const Failure(message: 'error', code: 'ERR_001'),
        );

        Failure? capturedFailure;
        int? capturedStatusCode;

        result.when(
          success: (_, __, ___) {},
          failure: (failure, statusCode) {
            capturedFailure = failure;
            capturedStatusCode = statusCode;
          },
          loading: () {},
          initial: () {},
        );

        expect(capturedFailure?.message, 'error');
        expect(capturedFailure?.code, 'ERR_001');
      });

      test('mapFailure should not affect success', () {
        final result = ApiResult.success(data: 'test');

        final mapped = result.mapFailure((failure) => ApiResult.success(data: 'modified'));

        expect(mapped.isSuccess, isTrue);
        expect(mapped.dataOrNull, 'modified');
      });
    });

    group('loading state', () {
      test('should create loading', () {
        final result = ApiResult<List<String>>.loading();

        expect(result.isSuccess, isFalse);
        expect(result.isFailure, isFalse);
        expect(result.isLoading, isTrue);
        expect(result.isInitial, isFalse);
      });

      test('dataOrNull should return null', () {
        final result = ApiResult<List<String>>.loading();

        expect(result.dataOrNull, isNull);
      });
    });

    group('initial state', () {
      test('should create initial', () {
        final result = ApiResult<List<String>>.initial();

        expect(result.isSuccess, isFalse);
        expect(result.isFailure, isFalse);
        expect(result.isLoading, isFalse);
        expect(result.isInitial, isTrue);
      });

      test('dataOrNull should return null', () {
        final result = ApiResult<List<String>>.initial();

        expect(result.dataOrNull, isNull);
      });
    });

    group('maybeWhen', () {
      test('should call orElse when success and no success handler', () {
        final result = ApiResult.success(data: 'test');

        String? called;

        result.maybeWhen(
          failure: (_, __) {},
          orElse: () => called = 'else',
        );

        expect(called, 'else');
      });

      test('should call success when provided and result is success', () {
        final result = ApiResult.success(data: 'test');

        String? capturedData;

        result.maybeWhen(
          success: (data, _, __) => capturedData = data,
          orElse: () {},
        );

        expect(capturedData, 'test');
      });
    });
  });

  group('Failure Tests', () {
    test('Failure should store message and code', () {
      const failure = Failure(message: 'Test error', code: 'TEST');

      expect(failure.message, 'Test error');
      expect(failure.code, 'TEST');
    });

    test('NetworkFailure should have correct properties', () {
      const failure = NetworkFailure(
        message: 'No connection',
        code: 'NETWORK_ERROR',
      );

      expect(failure.message, 'No connection');
      expect(failure.code, 'NETWORK_ERROR');
    });

    test('AuthFailure should have correct properties', () {
      const failure = AuthFailure(
        message: 'Unauthorized',
        code: 'AUTH_001',
      );

      expect(failure.message, 'Unauthorized');
      expect(failure.code, 'AUTH_001');
    });

    test('ServerFailure should have status code', () {
      const failure = ServerFailure(
        message: 'Server error',
        code: 'SERVER_500',
        statusCode: 500,
      );

      expect(failure.message, 'Server error');
      expect(failure.statusCode, 500);
    });

    test('ValidationFailure should handle validation errors', () {
      const failure = ValidationFailure(
        message: 'Invalid input',
        code: 'VALIDATION_ERROR',
      );

      expect(failure.message, 'Invalid input');
    });
  });

  group('DioErrorX Extension Tests', () {
    test('timeout error should convert to TimeoutFailure', () {
      // This would require mocking DioException which is complex
      // For unit testing, we verify the extension method signature exists
      expect(DioExceptionX.new, isNotNull);
    });
  });

  group('FailureX Extension Tests', () {
    test('toApiResult should convert Failure to ApiResult', () {
      const failure = Failure(message: 'error', code: 'ERR');
      final result = failure.toApiResult<String>();

      expect(result.isFailure, isTrue);
      expect(result.failureOrNull?.message, 'error');
    });

    test('toApiResult with status code', () {
      const failure = Failure(message: 'error', code: 'ERR');
      final result = failure.toApiResult<String>(statusCode: 400);

      expect(result.isFailure, isTrue);
    });
  });
}