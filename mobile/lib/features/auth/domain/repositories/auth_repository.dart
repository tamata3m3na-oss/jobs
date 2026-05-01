import '../../../../shared/utils/api_result.dart';
import '../entities/user.dart';
import '../models/auth_models.dart';

abstract class AuthRepository {
  Future<ApiResult<AuthResult>> login(LoginRequest request);
  Future<ApiResult<AuthResult>> register(RegisterRequest request);
  Future<void> logout();
  Future<ApiResult<User>> getCurrentUser();
  Future<bool> refreshToken();
}
