import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/job.dart';

part 'job_model.freezed.dart';
part 'job_model.g.dart';

@freezed
class JobModel with _$JobModel {
  const factory JobModel({
    required String id,
    required String title,
    required String companyName,
    required String description,
    required Map<String, dynamic> location,
    Map<String, dynamic>? salary,
    double? distance,
  }) = _JobModel;

  factory JobModel.fromJson(Map<String, dynamic> json) => _$JobModelFromJson(json);

  factory JobModel.fromEntity(Job job) {
    return JobModel(
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      location: {
        'type': 'Point',
        'coordinates': [job.longitude, job.latitude],
      },
      distance: job.distance,
    );
  }
}

extension JobModelX on JobModel {
  Job toEntity() {
    final coords = location['coordinates'] as List<dynamic>;
    return Job(
      id: id,
      title: title,
      companyName: companyName,
      description: description,
      longitude: (coords[0] as num).toDouble(),
      latitude: (coords[1] as num).toDouble(),
      distance: distance,
      salary: salary != null ? "${salary!['min']} - ${salary!['max']} ${salary!['currency']}" : null,
    );
  }
}
