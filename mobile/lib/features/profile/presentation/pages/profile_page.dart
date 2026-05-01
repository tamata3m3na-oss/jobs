import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/skeleton_widget.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/settings_provider.dart';

/// User profile page with Riverpod state management
class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileProvider.notifier).loadProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Profile',
          style: AppTypography.titleLarge.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push(AppRoutes.settings),
          ),
        ],
      ),
      body: profileState.isLoading
          ? const ProfileSkeleton()
          : profileState.errorMessage != null
              ? ErrorDisplayWidget(
                  message: profileState.errorMessage!,
                  onRetry: () => ref.read(profileProvider.notifier).loadProfile(),
                )
              : profileState.user == null
                  ? const EmptyStateWidget(
                      title: 'No profile data available',
                      message: 'Please sign in to view your profile',
                      icon: Icons.person_outline,
                    )
                  : _buildProfileContent(profileState.user!),
    );
  }

  Widget _buildProfileContent(user) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.screenPaddingHorizontal,
        vertical: AppSpacing.screenPaddingVertical,
      ),
      child: Column(
        children: [
          const SizedBox(height: AppSpacing.lg),
          _ProfileHeader(user: user),
          const SizedBox(height: AppSpacing.xl),
          _buildMenuSection(),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildMenuSection() {
    return Column(
      children: [
        _SectionTitle(title: 'Account'),
        const SizedBox(height: AppSpacing.sm),
        _MenuCard(
          children: [
            _MenuItem(
              icon: Icons.person_outline,
              iconColor: AppColors.info,
              title: 'Edit Profile',
              subtitle: 'Update your personal information',
              onTap: () {
                // TODO: Navigate to edit profile
              },
            ),
            _MenuItem(
              icon: Icons.work_outline,
              iconColor: AppColors.success,
              title: 'My Applications',
              subtitle: 'Track your job applications',
              onTap: () => context.push('/profile/applications'),
            ),
            _MenuItem(
              icon: Icons.bookmark_outline,
              iconColor: AppColors.warning,
              title: 'Saved Jobs',
              subtitle: 'View your bookmarked jobs',
              onTap: () => context.push('/profile/saved-jobs'),
              isLast: true,
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(title: 'Preferences'),
        const SizedBox(height: AppSpacing.sm),
        _MenuCard(
          children: [
            _MenuItem(
              icon: Icons.notifications_outlined,
              iconColor: AppColors.primary,
              title: 'Notifications',
              subtitle: 'Manage notification settings',
              onTap: () {
                // TODO: Navigate to notifications settings
              },
            ),
            _MenuItem(
              icon: Icons.language_outlined,
              iconColor: AppColors.secondary,
              title: 'Language',
              subtitle: ref.watch(currentLocaleProvider).languageCode == 'ar'
                  ? 'العربية'
                  : 'English',
              onTap: () => context.push(AppRoutes.settings),
              isLast: true,
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(title: 'Support'),
        const SizedBox(height: AppSpacing.sm),
        _MenuCard(
          children: [
            _MenuItem(
              icon: Icons.help_outline,
              iconColor: AppColors.info,
              title: 'Help & Support',
              subtitle: 'Get help with using the app',
              onTap: () {
                // TODO: Navigate to help
              },
            ),
            _MenuItem(
              icon: Icons.info_outline,
              iconColor: AppColors.grey600,
              title: 'About',
              subtitle: 'App version and information',
              onTap: () => _showAboutDialog(),
              isLast: true,
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(title: 'Danger Zone'),
        const SizedBox(height: AppSpacing.sm),
        _MenuCard(
          children: [
            _MenuItem(
              icon: Icons.logout,
              iconColor: AppColors.error,
              title: 'Logout',
              subtitle: 'Sign out of your account',
              onTap: () => _handleLogout(),
              isLast: true,
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Logout',
          style: AppTypography.titleLarge,
        ),
        content: Text(
          'Are you sure you want to logout?',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(
              'Cancel',
              style: AppTypography.labelLarge.copyWith(
                color: AppColors.grey600,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: Text(
              'Logout',
              style: AppTypography.labelLarge.copyWith(
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(authStateProvider.notifier).logout();
      ref.read(profileProvider.notifier).clearProfile();
      context.go(AppRoutes.login);
    }
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: const Icon(
                Icons.work,
                color: AppColors.primary,
                size: AppSpacing.iconLg,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Smart Job',
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Version 1.0.0',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.grey500,
                  ),
                ),
              ],
            ),
          ],
        ),
        content: Text(
          'Smart Job is an AI-powered job matching platform that helps you find the perfect job opportunity based on your skills and preferences.',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final dynamic user;

  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    final name = user.fullName ?? 'User';
    final email = user.email ?? '';
    final avatarUrl = user.avatarUrl as String?;
    final role = user.role ?? 'job_seeker';
    final roleLabel = role == 'employer' ? 'Employer' : 'Job Seeker';

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withOpacity(0.1),
          ),
          child: CircleAvatar(
            radius: 50,
            backgroundColor: AppColors.primary.withOpacity(0.2),
            backgroundImage: avatarUrl != null ? NetworkImage(avatarUrl) : null,
            child: avatarUrl == null
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: AppTypography.displaySmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  )
                : null,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          name,
          style: AppTypography.headlineSmall.copyWith(
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          email,
          style: AppTypography.bodyMedium.copyWith(
            color: AppColors.grey600,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.xs,
          ),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
          ),
          child: Text(
            roleLabel,
            style: AppTypography.labelMedium.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: AppSpacing.xs),
        child: Text(
          title,
          style: AppTypography.titleSmall.copyWith(
            color: AppColors.grey700,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  final List<Widget> children;

  const _MenuCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        border: Border.all(
          color: AppColors.grey200,
          width: 1,
        ),
      ),
      child: Column(
        children: children,
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool isLast;

  const _MenuItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.vertical(
        bottom: isLast ? const Radius.circular(AppSpacing.radiusMd) : Radius.zero,
      ),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.base),
        decoration: BoxDecoration(
          border: isLast
              ? null
              : Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.grey800 : AppColors.grey100,
                    width: 1,
                  ),
                ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Icon(
                icon,
                color: iconColor,
                size: AppSpacing.iconSm,
              ),
            ),
            const SizedBox(width: AppSpacing.base),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xxs),
                  Text(
                    subtitle,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.grey500,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: AppColors.grey400,
              size: AppSpacing.iconSm,
            ),
          ],
        ),
      ),
    );
  }
}