import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

/// Typedef for retry callback functions
typedef RetryCallback = Future<void> Function();

/// Helper class for building consistent retry UI components
class RetryHandler {
  RetryHandler._();

  /// Builds a standard retry button widget
  static Widget buildRetryButton({
    required VoidCallback onRetry,
    String label = 'Retry',
    IconData icon = Icons.refresh,
    bool isLoading = false,
    bool fullWidth = true,
  }) {
    final button = ElevatedButton.icon(
      onPressed: isLoading ? null : onRetry,
      icon: isLoading
          ? SizedBox(
              width: AppSpacing.iconSm,
              height: AppSpacing.iconSm,
              child: const CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : Icon(icon, size: AppSpacing.iconSm),
      label: Text(label),
    );

    if (fullWidth) {
      return SizedBox(
        width: double.infinity,
        height: AppSpacing.buttonHeightMd,
        child: button,
      );
    }

    return button;
  }

  /// Builds a retry widget with icon and message
  static Widget buildRetryWidget({
    required RetryCallback onRetry,
    String? message,
    String? title,
    IconData icon = Icons.error_outline,
    Color? iconColor,
    bool showLoadingIndicator = true,
    bool isRetrying = false,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showLoadingIndicator && isRetrying)
              const CircularProgressIndicator()
            else
              Icon(
                icon,
                size: 64,
                color: iconColor ?? AppColors.error,
              ),
            if (title != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(
                title,
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (message != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                message,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.grey600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            buildRetryButton(
              onRetry: onRetry,
              isLoading: isRetrying,
              fullWidth: false,
            ),
          ],
        ),
      ),
    );
  }

  /// Builds a compact retry text button
  static Widget buildCompactRetry({
    required VoidCallback onRetry,
    String label = 'Tap to retry',
    bool isLoading = false,
  }) {
    return TextButton.icon(
      onPressed: isLoading ? null : onRetry,
      icon: isLoading
          ? const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
              ),
            )
          : const Icon(Icons.refresh, size: 14),
      label: Text(label),
    );
  }

  /// Builds a card-style retry widget for use in lists
  static Widget buildCardRetry({
    required RetryCallback onRetry,
    String? title,
    String? subtitle,
    IconData icon = Icons.warning_amber_rounded,
    bool isRetrying = false,
  }) {
    return Card(
      margin: const EdgeInsets.all(AppSpacing.cardMargin),
      child: InkWell(
        onTap: isRetrying ? null : onRetry,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.cardPadding),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.errorLight.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Icon(
                  icon,
                  color: AppColors.error,
                  size: AppSpacing.iconMd,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title ?? 'Something went wrong',
                      style: AppTypography.titleSmall,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: AppSpacing.xxs),
                      Text(
                        subtitle,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (isRetrying)
                const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                )
              else
                const Icon(Icons.refresh),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds an inline retry indicator for list items
  static Widget buildInlineRetry({
    required VoidCallback onRetry,
    String? message,
    bool isRetrying = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.errorLight.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isRetrying) ...[
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          Flexible(
            child: Text(
              message ?? 'Failed to load. Tap to retry.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.error,
              ),
            ),
          ),
          if (!isRetrying) ...[
            const SizedBox(width: AppSpacing.sm),
            InkWell(
              onTap: onRetry,
              child: const Padding(
                padding: EdgeInsets.all(AppSpacing.xxs),
                child: Icon(
                  Icons.refresh,
                  size: 16,
                  color: AppColors.error,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
