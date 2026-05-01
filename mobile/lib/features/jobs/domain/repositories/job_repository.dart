import '../../../../shared/models/application_model.dart';
import '../../../../shared/models/job_model.dart';
import '../../../../shared/utils/api_result.dart';

abstract class JobRepository {
  Future<ApiResult<List<JobModel>>> getJobs({
    int page = 1,
    int limit = 20,
    String? query,
    String? jobType,
    String? location,
    String? status,
  });

  Future<ApiResult<List<JobModel>>> getNearbyJobs({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int limit = 20,
  });

  Future<ApiResult<JobModel>> getJobById(String id);

  Future<ApiResult<ApplicationModel>> applyToJob({
    required String jobId,
    String? coverLetter,
    List<String>? answers,
  });

  Future<ApiResult<List<ApplicationModel>>> getMyApplications({
    int page = 1,
    int limit = 20,
  });
  
  Future<ApiResult<List<JobModel>>> getSavedJobs({
    int page = 1,
    int limit = 20,
  });

  Future<ApiResult<bool>> saveJob(String jobId);

  Future<ApiResult<bool>> unsaveJob(String jobId);
}
