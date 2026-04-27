import 'package:dio/dio.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> register({
    required String email,
    required String password,
    required String fullName,
    required String role,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl({required this.dio});

  @override
  Future<UserModel> login(String email, String password) async {
    final response = await dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      return UserModel.fromJson(response.data['data']);
    } else {
      throw Exception();
    }
  }

  @override
  Future<UserModel> register({
    required String email,
    required String password,
    required String fullName,
    required String role,
  }) async {
    final response = await dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'fullName': fullName,
      'role': role,
    });

    if (response.statusCode == 201) {
      return UserModel.fromJson(response.data['data']);
    } else {
      throw Exception();
    }
  }
}
