import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

/// User model for authentication and profile data
/// Uses Freezed for immutable data classes with JSON serialization
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String email,
    String? fullName,
    String? phone,
    String? avatarUrl,
    required String role,
    String? bio,
    String? location,
    @Default(false) bool isEmailVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}

/// User roles in the system
enum UserRole {
  @JsonValue('job_seeker')
  jobSeeker,
  @JsonValue('employer')
  employer,
  @JsonValue('admin')
  admin,
}

/// Extension methods for UserModel
extension UserModelX on UserModel {
  /// Check if user is a job seeker
  bool get isJobSeeker => role == 'job_seeker';

  /// Check if user is an employer
  bool get isEmployer => role == 'employer';

  /// Check if user is an admin
  bool get isAdmin => role == 'admin';

  /// Get display name for the user
  String get displayName => fullName ?? email.split('@').first;

  /// Check if user has verified email
  bool get isVerified => isEmailVerified;
}