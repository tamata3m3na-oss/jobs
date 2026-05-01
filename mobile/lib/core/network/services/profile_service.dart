import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';

import '../../shared/models/user_model.dart';
import '../../shared/models/application_model.dart';
import '../api_client.dart';

/// Profile service for user profile management
@lazySingleton
class ProfileService {
  final ApiClient _apiClient;

  ProfileService({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Get the current user's profile
  Future<UserModel> getProfile() async {
    final response = await _apiClient.dio.get('/profile');
    return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Update the current user's profile
  Future<UserModel> updateProfile({
    String? fullName,
    String? phone,
    String? bio,
    String? location,
    String? avatarUrl,
  }) async {
    final response = await _apiClient.dio.patch(
      '/profile',
      data: {
        if (fullName != null) 'fullName': fullName,
        if (phone != null) 'phone': phone,
        if (bio != null) 'bio': bio,
        if (location != null) 'location': location,
        if (avatarUrl != null) 'avatarUrl': avatarUrl,
      },
    );

    return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Upload profile avatar
  Future<String> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath),
    });

    final response = await _apiClient.dio.post(
      '/profile/avatar',
      data: formData,
    );

    return response.data['data']['url'] as String;
  }

  /// Get applications for the current user (job seeker)
  Future<List<ApplicationModel>> getMyApplications({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final response = await _apiClient.dio.get(
      '/applications/me',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );

    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) => ApplicationModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Get applications for employer's jobs
  Future<List<ApplicationModel>> getEmployerApplications({
    String? jobId,
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final response = await _apiClient.dio.get(
      '/applications',
      queryParameters: {
        if (jobId != null) 'jobId': jobId,
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );

    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) => ApplicationModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Update application status (employer only)
  Future<ApplicationModel> updateApplicationStatus(
    String applicationId,
    String status, {
    String? notes,
  }) async {
    final response = await _apiClient.dio.patch(
      '/applications/$applicationId',
      data: {
        'status': status,
        if (notes != null) 'employerNotes': notes,
      },
    );

    return ApplicationModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Get a specific application by ID
  Future<ApplicationModel> getApplication(String applicationId) async {
    final response = await _apiClient.dio.get('/applications/$applicationId');
    return ApplicationModel.fromJson(
        response.data['data'] as Map<String, dynamic>);
  }

  /// Delete user account
  Future<void> deleteAccount() async {
    await _apiClient.dio.delete('/profile');
  }
}