import 'package:injectable/injectable.dart';

import '../../shared/models/application_model.dart';
import '../api_client.dart';

/// Applications service for job application management
@lazySingleton
class ApplicationsService {
  final ApiClient _apiClient;

  ApplicationsService({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Submit a job application
  Future<ApplicationModel> applyToJob({
    required String jobId,
    String? coverLetter,
    List<String>? answers,
  }) async {
    final response = await _apiClient.dio.post(
      '/applications',
      data: {
        'jobId': jobId,
        if (coverLetter != null) 'coverLetter': coverLetter,
        if (answers != null) 'answers': answers,
      },
    );

    return ApplicationModel.fromJson(
        response.data['data'] as Map<String, dynamic>);
  }

  /// Withdraw an application
  Future<void> withdrawApplication(String applicationId) async {
    await _apiClient.dio.post('/applications/$applicationId/withdraw');
  }

  /// Get application status
  Future<ApplicationModel> getApplicationStatus(String applicationId) async {
    final response =
        await _apiClient.dio.get('/applications/$applicationId/status');
    return ApplicationModel.fromJson(
        response.data['data'] as Map<String, dynamic>);
  }

  /// Check if user has already applied to a job
  Future<bool> hasApplied(String jobId) async {
    final response = await _apiClient.dio.get('/applications/check/$jobId');
    return response.data['data']['applied'] as bool;
  }

  /// Get application timeline/events
  Future<List<ApplicationEvent>> getApplicationTimeline(
      String applicationId) async {
    final response =
        await _apiClient.dio.get('/applications/$applicationId/timeline');
    final data = response.data['data'] as List<dynamic>;
    return data
        .map((json) =>
            ApplicationEvent.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}

/// Application event in the timeline
@lazySingleton
class ApplicationEvent {
  final String id;
  final String type;
  final String title;
  final String? description;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;

  ApplicationEvent({
    required this.id,
    required this.type,
    required this.title,
    this.description,
    required this.timestamp,
    this.metadata,
  });

  factory ApplicationEvent.fromJson(Map<String, dynamic> json) {
    return ApplicationEvent(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}