import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../../shared/models/job_model.dart';
import '../providers/jobs_provider.dart';

/// Job detail page with Riverpod state management
class JobDetailPage extends ConsumerWidget {
  final String jobId;

  const JobDetailPage({super.key, required this.jobId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobAsync = ref.watch(jobDetailProvider(jobId));

    return Scaffold(
      body: jobAsync.when(
        data: (job) => _JobDetailContent(job: job),
        loading: () => const Scaffold(
          body: LoadingWidget(message: 'Loading job details...'),
        ),
        error: (error, stack) => Scaffold(
          appBar: AppBar(title: const Text('Error')),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text('Failed to load job: $error'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.invalidate(jobDetailProvider(jobId)),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
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
        // App bar with company logo
        SliverAppBar(
          expandedHeight: 200,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Theme.of(context).colorScheme.primary,
                    Theme.of(context).colorScheme.primaryContainer,
                  ],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          job.companyName.isNotEmpty
                              ? job.companyName[0].toUpperCase()
                              : '?',
                          style: TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      job.companyName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Colors.white,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Job content
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  job.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 16),

                // Quick info chips
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _InfoChip(
                      icon: Icons.location_on_outlined,
                      label: job.location,
                    ),
                    if (job.salaryRange != null)
                      _InfoChip(
                        icon: Icons.attach_money,
                        label: job.salaryRange!,
                        isPrimary: true,
                      ),
                    _InfoChip(
                      icon: Icons.work_outline,
                      label: _getJobTypeLabel(job.type),
                    ),
                    if (job.isRemote)
                      _InfoChip(
                        icon: Icons.home_outlined,
                        label: 'Remote',
                      ),
                  ],
                ),
                const SizedBox(height: 24),

                // Description
                _SectionHeader(title: 'Job Description'),
                const SizedBox(height: 8),
                Text(
                  job.description,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                // Requirements
                if (job.requirements != null) ...[
                  const SizedBox(height: 24),
                  _SectionHeader(title: 'Requirements'),
                  const SizedBox(height: 8),
                  Text(
                    job.requirements!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],

                // Responsibilities
                if (job.responsibilities != null) ...[
                  const SizedBox(height: 24),
                  _SectionHeader(title: 'Responsibilities'),
                  const SizedBox(height: 8),
                  Text(
                    job.responsibilities!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],

                // Skills
                if (job.skills != null && job.skills!.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  _SectionHeader(title: 'Skills'),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: job.skills!.map((skill) {
                      return Chip(
                        label: Text(skill),
                        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                      );
                    }).toList(),
                  ),
                ],

                // Benefits
                if (job.benefits != null && job.benefits!.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  _SectionHeader(title: 'Benefits'),
                  const SizedBox(height: 8),
                  ...job.benefits!.map((benefit) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            size: 20,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Expanded(child: Text(benefit)),
                        ],
                      ),
                    );
                  }),
                ],

                // Distance if available
                if (job.distance != null) ...[
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.near_me,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          '${job.formattedDistance} away',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 100), // Space for FAB
              ],
            ),
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

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isPrimary;

  const _InfoChip({
    required this.icon,
    required this.label,
    this.isPrimary = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isPrimary
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).colorScheme.onSurface;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isPrimary
            ? Theme.of(context).colorScheme.primaryContainer
            : Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(color: color, fontWeight: isPrimary ? FontWeight.w600 : FontWeight.normal),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }
}