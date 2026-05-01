import 'package:freezed_annotation/freezed_annotation.dart';

part 'job_model.freezed.dart';
part 'job_model.g.dart';

/// Job model representing a job listing
/// Uses Freezed for immutable data classes with JSON serialization
@freezed
class JobModel with _$JobModel {
  const factory JobModel({
    required String id,
    required String title,
    required String companyName,
    String? companyLogo,
    required String description,
    required String location,
    JobLocation? geoLocation,
    String? salaryMin,
    String? salaryMax,
    String? salaryCurrency,
    @Default(JobType.fullTime) JobType type,
    @Default(JobStatus.active) JobStatus status,
    List<String>? skills,
    List<String>? benefits,
    String? requirements,
    String? responsibilities,
    String? employerId,
    DateTime? createdAt,
    DateTime? expiresAt,
    @Default(false) bool isRemote,
    @Default(0) int applicationCount,
    double? distance,
  }) = _JobModel;

  factory JobModel.fromJson(Map<String, dynamic> json) =>
      _$JobModelFromJson(json);
}

/// Job type enum
enum JobType {
  @JsonValue('full_time')
  fullTime,
  @JsonValue('part_time')
  partTime,
  @JsonValue('contract')
  contract,
  @JsonValue('internship')
  internship,
  @JsonValue('temporary')
  temporary,
}

/// Job status enum
enum JobStatus {
  @JsonValue('active')
  active,
  @JsonValue('pending')
  pending,
  @JsonValue('closed')
  closed,
  @JsonValue('draft')
  draft,
}

/// Geo location for job posting
@freezed
class JobLocation with _$JobLocation {
  const factory JobLocation({
    required double latitude,
    required double longitude,
    String? address,
    String? city,
    String? country,
  }) = _JobLocation;

  factory JobLocation.fromJson(Map<String, dynamic> json) =>
      _$JobLocationFromJson(json);
}

/// Extension methods for JobModel
extension JobModelX on JobModel {
  /// Get formatted salary range string
  String? get salaryRange {
    if (salaryMin == null && salaryMax == null) return null;
    final currency = salaryCurrency ?? '';
    if (salaryMin != null && salaryMax != null) {
      return '$salaryMin - $salaryMax $currency';
    }
    return salaryMin != null ? 'From $salaryMin $currency' : 'Up to $salaryMax $currency';
  }

  /// Check if job is active
  bool get isActive => status == JobStatus.active;

  /// Check if job has expired
  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());

  /// Get formatted distance string
  String? get formattedDistance {
    if (distance == null) return null;
    if (distance! < 1) {
      return '${(distance! * 1000).round()} m';
    }
    return '${distance!.toStringAsFixed(1)} km';
  }
}