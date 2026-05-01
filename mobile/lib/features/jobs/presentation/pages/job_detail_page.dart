import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/error_widget.dart' as shared;
import '../../../shared/widgets/loading_widget.dart';
import '../../../../shared/models/job_model.dart';
import '../providers/jobs_provider.dart';

class JobDetailPage extends ConsumerWidget {
  final String jobId;

  const JobDetailPage({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobAsync = ref.watch(jobDetailProvider(jobId));

    return Scaffold(
      bottomNavigationBar: jobAsync.when(
        data: (job) => _buildBottomBar(context, job),
        loading: () => null,
        error: (_, __) => null,
      ),
      body: jobAsync.when(
        data: (job) => _JobDetailContent(job: job),
        loading: () => const LoadingWidget(message: 'Loading job details...'),
        error: (error, stack) => shared.CustomErrorWidget(
          message: error.toString(),
          onRetry: () => ref.invalidate(jobDetailProvider(jobId)),
        ),
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, JobModel job) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.m),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () => context.push('/apply/${job.id}'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.m),
                ),
                child: const Text('Apply Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _JobDetailContent extends StatelessWidget {
  final JobModel job;

  const _JobDetailContent({required this.job});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 120,
          pinned: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.share_outlined),
              onPressed: () {
                Share.share('Check out this job: ${job.title} at ${job.companyName}');
              },
            ),
            IconButton(
              icon: const Icon(Icons.bookmark_border),
              onPressed: () {
                // TODO: Implement save job
              },
            ),
          ],
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.l),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: AppColors.neutral100,
                        borderRadius: BorderRadius.circular(AppSpacing.s),
                      ),
                      child: job.companyLogo != null
                          ? Image.network(job.companyLogo!, errorBuilder: (_, __, ___) => const Icon(Icons.business))
                          : const Icon(Icons.business, size: 30, color: AppColors.neutral400),
                    ),
                    const SizedBox(width: AppSpacing.m),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(job.title, style: AppTypography.h2),
                          const SizedBox(height: 4),
                          Text(
                            job.companyName,
                            style: AppTypography.bodyLarge.copyWith(color: AppColors.primary600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.l),
                _buildInfoGrid(),
                const SizedBox(height: AppSpacing.l),
                Text('Job Description', style: AppTypography.h3),
                const SizedBox(height: AppSpacing.s),
                Text(job.description, style: AppTypography.bodyMedium),
                if (job.requirements != null && job.requirements!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.l),
                  Text('Requirements', style: AppTypography.h3),
                  const SizedBox(height: AppSpacing.s),
                  Text(job.requirements!, style: AppTypography.bodyMedium),
                ],
                if (job.responsibilities != null && job.responsibilities!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.l),
                  Text('Responsibilities', style: AppTypography.h3),
                  const SizedBox(height: AppSpacing.s),
                  Text(job.responsibilities!, style: AppTypography.bodyMedium),
                ],
                if (job.skills != null && job.skills!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.l),
                  Text('Skills', style: AppTypography.h3),
                  const SizedBox(height: AppSpacing.s),
                  Wrap(
                    spacing: AppSpacing.s,
                    runSpacing: AppSpacing.s,
                    children: job.skills!.map((skill) => Chip(label: Text(skill))).toList(),
                  ),
                ],
                if (job.benefits != null && job.benefits!.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.l),
                  Text('Benefits', style: AppTypography.h3),
                  const SizedBox(height: AppSpacing.s),
                  ...job.benefits!.map((benefit) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, size: 18, color: AppColors.success500),
                            const SizedBox(width: AppSpacing.s),
                            Expanded(child: Text(benefit, style: AppTypography.bodyMedium)),
                          ],
                        ),
                      )),
                ],
                const SizedBox(height: AppSpacing.xl * 2),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoGrid() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.m),
      decoration: BoxDecoration(
        color: AppColors.neutral50,
        borderRadius: BorderRadius.circular(AppSpacing.m),
      ),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 3,
        children: [
          _buildInfoItem(Icons.location_on_outlined, 'Location', job.location),
          _buildInfoItem(Icons.work_outline, 'Type', _getJobTypeLabel(job.type)),
          _buildInfoItem(Icons.attach_money, 'Salary', job.salaryRange ?? 'Not specified'),
          _buildInfoItem(Icons.calendar_today_outlined, 'Posted', '2 days ago'),
        ],
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.neutral500),
        const SizedBox(width: AppSpacing.s),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label, style: AppTypography.labelSmall.copyWith(color: AppColors.neutral500)),
              Text(value, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
      ],
    );
  }

  String _getJobTypeLabel(JobType type) {
    switch (type) {
      case JobType.fullTime:
        return 'Full Time';
      case JobType.partTime:
        return 'Part Time';
      case JobType.contract:
        return 'Contract';
      case JobType.internship:
        return 'Internship';
      case JobType.temporary:
        return 'Temporary';
    }
  }
}
