import 'package:freezed_annotation/freezed_annotation.dart';

part 'application_model.freezed.dart';
part 'application_model.g.dart';

/// Application model representing a job application
/// Uses Freezed for immutable data classes with JSON serialization
@freezed
class ApplicationModel with _$ApplicationModel {
  const factory ApplicationModel({
    required String id,
    required String jobId,
    required String applicantId,
    String? coverLetter,
    String? resumeUrl,
    @Default(ApplicationStatus.pending) ApplicationStatus status,
    List<String>? answers,
    String? employerNotes,
    DateTime? createdAt,
    DateTime? updatedAt,
    JobSummary? job,
  }) = _ApplicationModel;

  factory ApplicationModel.fromJson(Map<String, dynamic> json) =>
      _$ApplicationModelFromJson(json);
}

/// Application status enum
enum ApplicationStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('reviewed')
  reviewed,
  @JsonValue('interview')
  interview,
  @JsonValue('offer')
  offer,
  @JsonValue('rejected')
  rejected,
  @JsonValue('withdrawn')
  withdrawn,
  @JsonValue('accepted')
  accepted,
}

/// Job summary for application listing
@freezed
class JobSummary with _$JobSummary {
  const factory JobSummary({
    required String id,
    required String title,
    String? companyName,
    String? companyLogo,
  }) = _JobSummary;

  factory JobSummary.fromJson(Map<String, dynamic> json) =>
      _$JobSummaryFromJson(json);
}

/// Extension methods for ApplicationModel
extension ApplicationModelX on ApplicationModel {
  /// Check if application is in pending status
  bool get isPending => status == ApplicationStatus.pending;

  /// Check if application is in active consideration
  bool get isActive =>
      status == ApplicationStatus.pending ||
      status == ApplicationStatus.reviewed ||
      status == ApplicationStatus.interview;

  /// Check if application is completed (hired or rejected)
  bool get isCompleted =>
      status == ApplicationStatus.offer ||
      status == ApplicationStatus.rejected ||
      status == ApplicationStatus.accepted ||
      status == ApplicationStatus.withdrawn;

  /// Get status display text
  String get statusDisplayText {
    switch (status) {
      case ApplicationStatus.pending:
        return 'Pending Review';
      case ApplicationStatus.reviewed:
        return 'Under Review';
      case ApplicationStatus.interview:
        return 'Interview Scheduled';
      case ApplicationStatus.offer:
        return 'Offer Received';
      case ApplicationStatus.rejected:
        return 'Not Selected';
      case ApplicationStatus.withdrawn:
        return 'Withdrawn';
      case ApplicationStatus.accepted:
        return 'Accepted';
    }
  }
}