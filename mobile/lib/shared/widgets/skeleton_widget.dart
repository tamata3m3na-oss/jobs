import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// Skeleton loading widget with shimmer effect
/// Provides consistent loading placeholders for content
class SkeletonBox extends StatefulWidget {
  final double? width;
  final double height;
  final double borderRadius;

  const SkeletonBox({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = AppSpacing.radiusSm,
  });

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? AppColors.grey800 : AppColors.grey200;
    final highlightColor = isDark ? AppColors.grey700 : AppColors.grey100;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              stops: [
                0.0,
                _animation.value.clamp(0.0, 1.0),
                1.0,
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Skeleton text line widget
class SkeletonText extends StatelessWidget {
  final double? width;
  final double height;
  final int lines;

  const SkeletonText({
    super.key,
    this.width,
    this.height = 14,
    this.lines = 1,
  });

  @override
  Widget build(BuildContext context) {
    if (lines == 1) {
      return SkeletonBox(
        width: width,
        height: height,
        borderRadius: AppSpacing.radiusXs,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(lines, (index) {
        final isLast = index == lines - 1;
        return Padding(
          padding: EdgeInsets.only(
            bottom: isLast ? 0 : AppSpacing.sm,
          ),
          child: SkeletonBox(
            width: isLast && width == null ? null : width,
            height: height,
            borderRadius: AppSpacing.radiusXs,
          ),
        );
      }),
    );
  }
}

/// Skeleton circle widget for avatar placeholders
class SkeletonCircle extends StatefulWidget {
  final double size;

  const SkeletonCircle({
    super.key,
    this.size = 48,
  });

  @override
  State<SkeletonCircle> createState() => _SkeletonCircleState();
}

class _SkeletonCircleState extends State<SkeletonCircle>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? AppColors.grey800 : AppColors.grey200;
    final highlightColor = isDark ? AppColors.grey700 : AppColors.grey100;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              stops: [
                0.0,
                _animation.value.clamp(0.0, 1.0),
                1.0,
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Skeleton loader for job card items
class JobCardSkeleton extends StatelessWidget {
  const JobCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.listItemSpacing),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const SkeletonCircle(size: 48),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SkeletonBox(
                        width: double.infinity,
                        height: 18,
                        borderRadius: AppSpacing.radiusXs,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      SkeletonBox(
                        width: 120,
                        height: 14,
                        borderRadius: AppSpacing.radiusXs,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                SkeletonBox(
                  width: 80,
                  height: 14,
                  borderRadius: AppSpacing.radiusXs,
                ),
                const SizedBox(width: AppSpacing.md),
                SkeletonBox(
                  width: 100,
                  height: 14,
                  borderRadius: AppSpacing.radiusXs,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            SkeletonBox(
              width: 100,
              height: 24,
              borderRadius: AppSpacing.radiusXs,
            ),
          ],
        ),
      ),
    );
  }
}

/// Skeleton loader for profile page
class ProfileSkeleton extends StatelessWidget {
  const ProfileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.screenPaddingHorizontal),
      child: Column(
        children: [
          const SizedBox(height: AppSpacing.xl),
          const Center(
            child: SkeletonCircle(size: 100),
          ),
          const SizedBox(height: AppSpacing.md),
          Center(
            child: SkeletonBox(
              width: 150,
              height: 24,
              borderRadius: AppSpacing.radiusXs,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Center(
            child: SkeletonBox(
              width: 100,
              height: 16,
              borderRadius: AppSpacing.radiusXs,
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          const SkeletonBox(
            width: double.infinity,
            height: 48,
            borderRadius: AppSpacing.radiusSm,
          ),
          const SizedBox(height: AppSpacing.xl),
          const _MenuSectionSkeleton(),
          const SizedBox(height: AppSpacing.lg),
          const _MenuSectionSkeleton(),
        ],
      ),
    );
  }
}

class _MenuSectionSkeleton extends StatelessWidget {
  const _MenuSectionSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        3,
        (index) => Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: Row(
            children: [
              const SkeletonCircle(size: 24),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: SkeletonBox(
                  height: 20,
                  borderRadius: AppSpacing.radiusXs,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// List skeleton wrapper for loading multiple items
class SkeletonList extends StatelessWidget {
  final int itemCount;
  final Widget Function(int index) itemBuilder;

  const SkeletonList({
    super.key,
    this.itemCount = 5,
    required this.itemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.screenPaddingHorizontal),
      itemCount: itemCount,
      itemBuilder: (context, index) => itemBuilder(index),
    );
  }
}
