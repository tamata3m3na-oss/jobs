import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/network/services/profile_service.dart';
import '../../../../shared/models/user_model.dart';

/// Settings state
class SettingsState {
  final ThemeMode themeMode;
  final Locale locale;
  final bool notificationsEnabled;
  final bool emailNotificationsEnabled;
  final double textScaleFactor;

  const SettingsState({
    this.themeMode = ThemeMode.system,
    this.locale = const Locale('en'),
    this.notificationsEnabled = true,
    this.emailNotificationsEnabled = true,
    this.textScaleFactor = 1.0,
  });

  SettingsState copyWith({
    ThemeMode? themeMode,
    Locale? locale,
    bool? notificationsEnabled,
    bool? emailNotificationsEnabled,
    double? textScaleFactor,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      locale: locale ?? this.locale,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      emailNotificationsEnabled: emailNotificationsEnabled ?? this.emailNotificationsEnabled,
      textScaleFactor: textScaleFactor ?? this.textScaleFactor,
    );
  }

  bool get isDarkMode => themeMode == ThemeMode.dark;
  bool get isArabic => locale.languageCode == 'ar';
}

/// Settings notifier provider
final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>((ref) {
  return SettingsNotifier();
});

/// Settings notifier for managing app settings
class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(const SettingsState());

  void setThemeMode(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
  }

  void toggleDarkMode() {
    final newMode = state.themeMode == ThemeMode.dark
        ? ThemeMode.light
        : ThemeMode.dark;
    state = state.copyWith(themeMode: newMode);
  }

  void setLocale(Locale locale) {
    state = state.copyWith(locale: locale);
  }

  void toggleNotifications() {
    state = state.copyWith(notificationsEnabled: !state.notificationsEnabled);
  }

  void toggleEmailNotifications() {
    state = state.copyWith(emailNotificationsEnabled: !state.emailNotificationsEnabled);
  }

  void setTextScaleFactor(double factor) {
    state = state.copyWith(textScaleFactor: factor.clamp(0.8, 1.4));
  }
}

/// Profile service provider
final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService(apiClient: ref.read(apiClientProvider));
});

/// Profile state
class ProfileState {
  final UserModel? user;
  final bool isLoading;
  final String? errorMessage;

  const ProfileState({
    this.user,
    this.isLoading = false,
    this.errorMessage,
  });

  ProfileState copyWith({
    UserModel? user,
    bool? isLoading,
    String? errorMessage,
  }) {
    return ProfileState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

/// Profile provider
final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(ref.read(profileServiceProvider));
});

/// Profile notifier for managing user profile
class ProfileNotifier extends StateNotifier<ProfileState> {
  final ProfileService _profileService;

  ProfileNotifier(this._profileService) : super(const ProfileState());

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final user = await _profileService.getProfile();
      state = state.copyWith(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
    }
  }

  Future<bool> updateProfile({
    String? fullName,
    String? phone,
    String? bio,
    String? location,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final updatedUser = await _profileService.updateProfile(
        fullName: fullName,
        phone: phone,
        bio: bio,
        location: location,
      );
      state = state.copyWith(user: updatedUser, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
      return false;
    }
  }

  Future<bool> uploadAvatar(String filePath) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final avatarUrl = await _profileService.uploadAvatar(filePath);
      if (state.user != null) {
        state = state.copyWith(
          user: state.user!.copyWith(avatarUrl: avatarUrl),
          isLoading: false,
        );
      }
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
      return false;
    }
  }

  Future<bool> deleteAccount() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      await _profileService.deleteAccount();
      state = const ProfileState();
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _formatError(e),
      );
      return false;
    }
  }

  void clearProfile() {
    state = const ProfileState();
  }

  String _formatError(dynamic error) {
    if (error.toString().contains('network')) {
      return 'Network error. Please check your connection.';
    }
    return 'Failed to update profile. Please try again.';
  }
}

/// Convenience provider for current locale
final currentLocaleProvider = Provider<Locale>((ref) {
  return ref.watch(settingsProvider).locale;
});

/// Convenience provider for theme mode
final themeModeProvider = Provider<ThemeMode>((ref) {
  return ref.watch(settingsProvider).themeMode;
});