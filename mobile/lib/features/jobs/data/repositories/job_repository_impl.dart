import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/job.dart';
import '../../domain/repositories/job_repository.dart';
import '../datasources/job_remote_data_source.dart';

class JobRepositoryImpl implements JobRepository {
  final JobRemoteDataSource remoteDataSource;

  JobRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<Job>>> getNearbyJobs({
    required double latitude,
    required double longitude,
    double radius = 10.0,
  }) async {
    try {
      final jobModels = await remoteDataSource.getNearbyJobs(
        latitude: latitude,
        longitude: longitude,
        radius: radius,
      );
      return Right(jobModels.map((model) => model.toEntity()).toList());
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
