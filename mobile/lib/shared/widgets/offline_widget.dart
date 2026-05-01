import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

/// Offline indicator widget shown when there's no internet connection
class OfflineIndicator extends StatelessWidget {
  final VoidCallback? onRetry;

  const OfflineIndicator({
    super.key,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.base,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.warning.withOpacity(0.9),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            const Icon(
              Icons.wifi_off,
              color: Colors.white,
              size: AppSpacing.iconSm,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                'You are offline',
                style: AppTypography.labelMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            if (onRetry != null)
              TextButton(
                onPressed: onRetry,
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                  ),
                ),
                child: Text(
                  'Retry',
                  style: AppTypography.labelMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Cached data indicator widget
class CachedIndicator extends StatelessWidget {
  final DateTime? cachedAt;
  final bool isStale;

  const CachedIndicator({
    super.key,
    this.cachedAt,
    this.isStale = false,
  });

  @override
  Widget build(BuildContext context) {
    if (cachedAt == null) return const SizedBox.shrink();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          isStale ? Icons.warning_amber : Icons.cached,
          size: AppSpacing.iconXs,
          color: isStale ? AppColors.warning : AppColors.grey500,
        ),
        const SizedBox(width: AppSpacing.xxs),
        Text(
          _getTimeAgo(cachedAt!),
          style: AppTypography.labelSmall.copyWith(
            color: AppColors.grey500,
          ),
        ),
      ],
    );
  }

  String _getTimeAgo(DateTime dateTime) {
    final difference = DateTime.now().difference(dateTime);
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}

/// Connection status widget for displaying online/offline state
class ConnectionStatusWidget extends StatelessWidget {
  final bool isOnline;
  final bool showLabel;

  const ConnectionStatusWidget({
    super.key,
    required this.isOnline,
    this.showLabel = true,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isOnline ? AppColors.success : AppColors.offline,
          ),
        ),
        if (showLabel) ...[
          const SizedBox(width: AppSpacing.xs),
          Text(
            isOnline ? 'Online' : 'Offline',
            style: AppTypography.labelSmall.copyWith(
              color: isOnline ? AppColors.success : AppColors.offline,
            ),
          ),
        ],
      ],
    );
  }
}