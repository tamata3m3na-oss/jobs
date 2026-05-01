import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

/// Logging interceptor for debugging API requests/responses
@injectable
class LoggingInterceptor extends Interceptor {
  final PrettyDioLogger _logger;

  LoggingInterceptor()
      : _logger = PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          requestBodyHeader: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          compact: true,
          maxWidth: 120,
          logPrint: (obj) => print('[API] $obj'),
        );

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Log request details
    print('[API] --> ${options.method} ${options.uri}');
    _logger.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    // Log response details
    print('[API] <-- ${response.statusCode} ${response.requestOptions.uri}');
    _logger.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Log error details
    print('[API] <-- ERROR ${err.response?.statusCode} ${err.requestOptions.uri}');
    _logger.onError(err, handler);
  }
}