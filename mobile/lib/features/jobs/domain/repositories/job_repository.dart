import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/job.dart';

abstract class JobRepository {
  Future<Either<Failure, List<Job>>> getNearbyJobs({
    required double latitude,
    required double longitude,
    double radius = 10.0, // km
  });
}
