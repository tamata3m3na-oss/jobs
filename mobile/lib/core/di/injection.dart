import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import '../network/api_client.dart';
import '../network/interceptors/auth_interceptor.dart';
import '../network/interceptors/error_interceptor.dart';
import '../network/interceptors/logging_interceptor.dart';
import '../network/services/auth_service.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../network/services/jobs_service.dart';
import '../network/services/applications_service.dart';
import '../network/services/profile_service.dart';

final sl = GetIt.instance;

/// Initialize dependency injection
Future<void> init() async {
  // External
  sl.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(),
  );

  // Interceptors
  sl.registerLazySingleton<AuthInterceptor>(
    () => AuthInterceptor(secureStorage: sl<FlutterSecureStorage>()),
  );
  sl.registerLazySingleton<LoggingInterceptor>(
    () => LoggingInterceptor(),
  );
  sl.registerLazySingleton<ErrorInterceptor>(
    () => ErrorInterceptor(),
  );

  // API Client
  sl.registerLazySingleton<ApiClient>(
    () => ApiClient(
      authInterceptor: sl<AuthInterceptor>(),
      loggingInterceptor: sl<LoggingInterceptor>(),
      errorInterceptor: sl<ErrorInterceptor>(),
    ),
  );

  // Services
  sl.registerLazySingleton<AuthService>(
    () => AuthService(apiClient: sl<ApiClient>()),
  );

  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(sl<AuthService>()),
  );
  sl.registerLazySingleton<JobsService>(
    () => JobsService(apiClient: sl<ApiClient>()),
  );
  sl.registerLazySingleton<ApplicationsService>(
    () => ApplicationsService(apiClient: sl<ApiClient>()),
  );
  sl.registerLazySingleton<ProfileService>(
    () => ProfileService(apiClient: sl<ApiClient>()),
  );
}

/// ApiClient provider for Riverpod
ApiClient apiClientProvider() => sl<ApiClient>();