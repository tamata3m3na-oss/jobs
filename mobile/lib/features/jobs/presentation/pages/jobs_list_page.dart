import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/error_widget.dart' as shared;
import '../../../shared/widgets/skeleton_widget.dart';
import '../../../../shared/models/job_model.dart';
import '../providers/jobs_provider.dart';

class JobsListPage extends ConsumerStatefulWidget {
  const JobsListPage({super.key});

  @override
  ConsumerState<JobsListPage> createState() => _JobsListPageState();
}

class _JobsListPageState extends ConsumerState<JobsListPage> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(jobsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final jobsAsync = ref.watch(jobsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Jobs'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchAndFilters(),
          Expanded(
            child: jobsAsync.when(
              data: (state) => RefreshIndicator(
                onRefresh: () => ref.read(jobsProvider.notifier).refresh(),
                child: _buildJobsList(state),
              ),
              loading: () => _buildSkeletonList(),
              error: (error, stack) => shared.CustomErrorWidget(
                message: error.toString(),
                onRetry: () => ref.read(jobsProvider.notifier).refresh(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.m),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            onChanged: (value) {
              ref.read(jobSearchQueryProvider.notifier).state = value;
            },
            decoration: InputDecoration(
              hintText: 'Search jobs, companies...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        ref.read(jobSearchQueryProvider.notifier).state = '';
                      },
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppSpacing.s),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: AppColors.neutral100,
            ),
          ),
          const SizedBox(height: AppSpacing.s),
          _buildFilterChips(),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    final selectedType = ref.watch(jobTypeFilterProvider);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          FilterChip(
            label: const Text('All Types'),
            selected: selectedType == null,
            onSelected: (selected) {
              if (selected) {
                ref.read(jobTypeFilterProvider.notifier).state = null;
              }
            },
          ),
          const SizedBox(width: AppSpacing.s),
          ...JobType.values.map((type) {
            final isSelected = selectedType == type;
            return Padding(
              padding: const EdgeInsets.only(right: AppSpacing.s),
              child: FilterChip(
                label: Text(_getJobTypeLabel(type)),
                selected: isSelected,
                onSelected: (selected) {
                  ref.read(jobTypeFilterProvider.notifier).state = selected ? type : null;
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildJobsList(JobsState state) {
    if (state.jobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 64, color: AppColors.neutral400),
            const SizedBox(height: AppSpacing.m),
            Text(
              'No jobs found',
              style: AppTypography.h3,
            ),
            const SizedBox(height: AppSpacing.s),
            const Text('Try adjusting your search or filters'),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(AppSpacing.m),
      itemCount: state.jobs.length + (state.hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.jobs.length) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.m),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final job = state.jobs[index];
        return _JobCard(job: job);
      },
    );
  }

  Widget _buildSkeletonList() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.m),
      itemCount: 5,
      itemBuilder: (context, index) => const Padding(
        padding: EdgeInsets.only(bottom: AppSpacing.m),
        child: Skeleton(height: 120, width: double.infinity),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.l)),
      ),
      builder: (context) => const _FilterBottomSheet(),
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

class _JobCard extends StatelessWidget {
  final JobModel job;

  const _JobCard({required this.job});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.m),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.s),
        side: const BorderSide(color: AppColors.neutral200),
      ),
      elevation: 0,
      child: InkWell(
        onTap: () => context.push('/jobs/${job.id}'),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.m),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.neutral100,
                      borderRadius: BorderRadius.circular(AppSpacing.xs),
                    ),
                    child: job.companyLogo != null
                        ? Image.network(job.companyLogo!, errorBuilder: (_, __, ___) => const Icon(Icons.business))
                        : const Icon(Icons.business, color: AppColors.neutral400),
                  ),
                  const SizedBox(width: AppSpacing.m),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          job.title,
                          style: AppTypography.h4,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          job.companyName,
                          style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.m),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 16, color: AppColors.neutral400),
                  const SizedBox(width: 4),
                  Text(job.location, style: AppTypography.bodySmall),
                  const SizedBox(width: AppSpacing.m),
                  const Icon(Icons.access_time, size: 16, color: AppColors.neutral400),
                  const SizedBox(width: 4),
                  Text(_getJobTypeLabel(job.type), style: AppTypography.bodySmall),
                ],
              ),
              const SizedBox(height: AppSpacing.s),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (job.salaryRange != null)
                    Text(
                      job.salaryRange!,
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.primary600,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  Text(
                    '2 days ago', // Placeholder for created at
                    style: AppTypography.labelSmall.copyWith(color: AppColors.neutral400),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
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

class _FilterBottomSheet extends ConsumerWidget {
  const _FilterBottomSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedType = ref.watch(jobTypeFilterProvider);
    final locationController = TextEditingController(text: ref.read(jobLocationFilterProvider));

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.l,
        right: AppSpacing.l,
        top: AppSpacing.l,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.l,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Filters', style: AppTypography.h2),
              TextButton(
                onPressed: () {
                  ref.read(jobTypeFilterProvider.notifier).state = null;
                  ref.read(jobLocationFilterProvider.notifier).state = null;
                  Navigator.pop(context);
                },
                child: const Text('Reset'),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.m),
          Text('Location', style: AppTypography.h4),
          const SizedBox(height: AppSpacing.s),
          TextField(
            controller: locationController,
            decoration: const InputDecoration(
              hintText: 'City, Country or Remote',
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
          ),
          const SizedBox(height: AppSpacing.m),
          Text('Job Type', style: AppTypography.h4),
          const SizedBox(height: AppSpacing.s),
          Wrap(
            spacing: AppSpacing.s,
            children: JobType.values.map((type) {
              return ChoiceChip(
                label: Text(_getJobTypeLabel(type)),
                selected: selectedType == type,
                onSelected: (selected) {
                  ref.read(jobTypeFilterProvider.notifier).state = selected ? type : null;
                },
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.l),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ref.read(jobLocationFilterProvider.notifier).state = locationController.text.isEmpty ? null : locationController.text;
                Navigator.pop(context);
              },
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
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
