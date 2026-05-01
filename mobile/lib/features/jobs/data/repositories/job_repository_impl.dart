import 'package:dio/dio.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/network/services/applications_service.dart';
import '../../../../core/network/services/jobs_service.dart';
import '../../../../shared/models/application_model.dart';
import '../../../../shared/models/job_model.dart';
import '../../../../shared/utils/api_result.dart';
import '../../domain/repositories/job_repository.dart';

class JobRepositoryImpl implements JobRepository {
  final JobsService _jobsService;
  final ApplicationsService _applicationsService;

  JobRepositoryImpl({
    required JobsService jobsService,
    required ApplicationsService applicationsService,
  })  : _jobsService = jobsService,
        _applicationsService = applicationsService;

  @override
  Future<ApiResult<List<JobModel>>> getJobs({
    int page = 1,
    int limit = 20,
    String? query,
    String? jobType,
    String? location,
    String? status,
  }) async {
    try {
      final jobs = await _jobsService.getJobs(
        page: page,
        limit: limit,
        query: query,
        jobType: jobType,
        location: location,
        status: status,
      );
      return ApiResult.success(data: jobs);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<List<JobModel>>> getNearbyJobs({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final jobs = await _jobsService.getNearbyJobs(
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        page: page,
        limit: limit,
      );
      return ApiResult.success(data: jobs);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<JobModel>> getJobById(String id) async {
    try {
      final job = await _jobsService.getJob(id);
      return ApiResult.success(data: job);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<ApplicationModel>> applyToJob({
    required String jobId,
    String? coverLetter,
    List<String>? answers,
  }) async {
    try {
      final application = await _applicationsService.applyToJob(
        jobId: jobId,
        coverLetter: coverLetter,
        answers: answers,
      );
      return ApiResult.success(data: application);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<List<ApplicationModel>>> getMyApplications({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final applications = await _applicationsService.getMyApplications(
        page: page,
        limit: limit,
      );
      return ApiResult.success(data: applications);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<List<JobModel>>> getSavedJobs({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final jobs = await _jobsService.getSavedJobs(
        page: page,
        limit: limit,
      );
      return ApiResult.success(data: jobs);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<bool>> saveJob(String jobId) async {
    try {
      await _jobsService.saveJob(jobId);
      return const ApiResult.success(data: true);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }

  @override
  Future<ApiResult<bool>> unsaveJob(String jobId) async {
    try {
      await _jobsService.unsaveJob(jobId);
      return const ApiResult.success(data: true);
    } on DioException catch (e) {
      return ApiResult.failure(failure: e.toFailure());
    } catch (e) {
      return ApiResult.failure(failure: UnknownFailure(message: e.toString()));
    }
  }
}
