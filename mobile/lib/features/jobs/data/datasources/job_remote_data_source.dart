import 'package:dio/dio.dart';
import '../models/job_model.dart';

abstract class JobRemoteDataSource {
  Future<List<JobModel>> getNearbyJobs({
    required double latitude,
    required double longitude,
    required double radius,
  });
}

class JobRemoteDataSourceImpl implements JobRemoteDataSource {
  final Dio dio;

  JobRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<JobModel>> getNearbyJobs({
    required double latitude,
    required double longitude,
    required double radius,
  }) async {
    final response = await dio.get('/jobs/nearby', queryParameters: {
      'lat': latitude,
      'lng': longitude,
      'radius': radius,
    });

    if (response.statusCode == 200) {
      final List<dynamic> data = response.data['data'];
      return data.map((json) => JobModel.fromJson(json)).toList();
    } else {
      throw Exception();
    }
  }
}
