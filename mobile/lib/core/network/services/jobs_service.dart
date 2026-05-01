import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';

import '../../shared/models/job_model.dart';
import '../api_client.dart';

/// Jobs service for job listing and search operations
@lazySingleton
class JobsService {
  final ApiClient _apiClient;

  JobsService({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Get nearby jobs based on location
  Future<List<JobModel>> getNearbyJobs({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int limit = 20,
    String? query,
    String? jobType,
    String? status,
  }) async {
    final response = await _apiClient.dio.get(
      '/jobs/nearby',
      queryParameters: {
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
        'page': page,
        'limit': limit,
        if (query != null) 'q': query,
        if (jobType != null) 'type': jobType,
        if (status != null) 'status': status,
      },
    );

    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) => JobModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Get all jobs with optional filtering
  Future<List<JobModel>> getJobs({
    int page = 1,
    int limit = 20,
    String? query,
    String? jobType,
    String? status,
    String? location,
  }) async {
    final response = await _apiClient.dio.get(
      '/jobs',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (query != null) 'q': query,
        if (jobType != null) 'type': jobType,
        if (status != null) 'status': status,
        if (location != null) 'location': location,
      },
    );

    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) => JobModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Get a single job by ID
  Future<JobModel> getJob(String jobId) async {
    final response = await _apiClient.dio.get('/jobs/$jobId');
    return JobModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Create a new job (employer only)
  Future<JobModel> createJob({
    required String title,
    required String description,
    required String location,
    double? latitude,
    double? longitude,
    String? salaryMin,
    String? salaryMax,
    String? salaryCurrency,
    String? type,
    List<String>? skills,
    List<String>? benefits,
    String? requirements,
    String? responsibilities,
  }) async {
    final response = await _apiClient.dio.post(
      '/jobs',
      data: {
        'title': title,
        'description': description,
        'location': location,
        if (latitude != null && longitude != null)
          'geoLocation': {
            'latitude': latitude,
            'longitude': longitude,
          },
        if (salaryMin != null) 'salaryMin': salaryMin,
        if (salaryMax != null) 'salaryMax': salaryMax,
        if (salaryCurrency != null) 'salaryCurrency': salaryCurrency,
        if (type != null) 'type': type,
        if (skills != null) 'skills': skills,
        if (benefits != null) 'benefits': benefits,
        if (requirements != null) 'requirements': requirements,
        if (responsibilities != null) 'responsibilities': responsibilities,
      },
    );

    return JobModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Update a job (employer only)
  Future<JobModel> updateJob(String jobId, Map<String, dynamic> data) async {
    final response = await _apiClient.dio.patch(
      '/jobs/$jobId',
      data: data,
    );

    return JobModel.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  /// Delete a job (employer only)
  Future<void> deleteJob(String jobId) async {
    await _apiClient.dio.delete('/jobs/$jobId');
  }

  /// Get jobs saved by the current user
  Future<List<JobModel>> getSavedJobs({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _apiClient.dio.get(
      '/jobs/saved',
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );

    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) => JobModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Save a job to favorites
  Future<void> saveJob(String jobId) async {
    await _apiClient.dio.post('/jobs/$jobId/save');
  }

  /// Unsave a job from favorites
  Future<void> unsaveJob(String jobId) async {
    await _apiClient.dio.delete('/jobs/$jobId/save');
  }

  /// Get recommended jobs for the current user
  Future<List<JobModel>> getRecommendedJobs({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _apiClient.dio.get(
      '/jobs/recommended',
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );

    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) => JobModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}