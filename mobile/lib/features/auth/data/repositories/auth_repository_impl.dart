import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import '../../../../core/network/services/auth_service.dart';
import '../../../../shared/models/user_model.dart' as shared_user;
import '../../../../shared/utils/api_result.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/user.dart';
import '../../domain/models/auth_models.dart';
import '../../domain/repositories/auth_repository.dart';

@LazySingleton(as: AuthRepository)
class AuthRepositoryImpl implements AuthRepository {
  final AuthService _authService;

  AuthRepositoryImpl(this._authService);

  @override
  Future<ApiResult<AuthResult>> login(LoginRequest request) async {
    try {
      final data = await _authService.login(
        email: request.email,
        password: request.password,
      );
      
      final userModel = shared_user.UserModel.fromJson(data['user']);
      final authResult = AuthResult(
        user: _mapUserModelToEntity(userModel),
        accessToken: data['accessToken'],
        refreshToken: data['refreshToken'],
      );
      
      return ApiResult.success(data: authResult);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: Failure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<AuthResult>> register(RegisterRequest request) async {
    try {
      final data = await _authService.register(
        email: request.email,
        password: request.password,
        fullName: request.fullName,
        role: request.role,
        phone: request.phone,
      );
      
      final userModel = shared_user.UserModel.fromJson(data['user']);
      final authResult = AuthResult(
        user: _mapUserModelToEntity(userModel),
        accessToken: data['accessToken'],
        refreshToken: data['refreshToken'],
      );
      
      return ApiResult.success(data: authResult);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: Failure(message: e.toString()));
    }
  }

  @override
  Future<void> logout() async {
    await _authService.logout();
  }

  @override
  Future<ApiResult<User>> getCurrentUser() async {
    try {
      final userModel = await _authService.getCurrentUser();
      return ApiResult.success(data: _mapUserModelToEntity(userModel));
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: Failure(message: e.toString()));
    }
  }

  @override
  Future<bool> refreshToken() async {
    try {
      await _authService.refreshToken();
      return true;
    } catch (e) {
      return false;
    }
  }

  User _mapUserModelToEntity(shared_user.UserModel model) {
    return User(
      id: model.id,
      email: model.email,
      fullName: model.fullName,
      role: model.role,
    );
  }
}
