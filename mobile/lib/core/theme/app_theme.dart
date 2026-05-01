import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Application theme configuration with light and dark themes
/// Supports Material 3, RTL/LTR layouts, and consistent styling
class AppTheme {
  AppTheme._();

  /// Light theme configuration
  static ThemeData get light => _buildTheme(Brightness.light);

  /// Dark theme configuration
  static ThemeData get dark => _buildTheme(Brightness.dark);

  static ThemeData _buildTheme(Brightness brightness) {
    final bool isDark = brightness == Brightness.dark;

    final Color backgroundColor =
        isDark ? AppColors.darkBackground : AppColors.lightBackground;
    final Color surfaceColor = isDark ? AppColors.darkSurface : AppColors.lightSurface;
    final Color cardColor = isDark ? AppColors.darkCard : AppColors.lightCard;
    final Color dividerColor = isDark ? AppColors.darkDivider : AppColors.lightDivider;
    final Color textColor = isDark ? AppColors.darkText : AppColors.lightText;
    final Color textSecondaryColor =
        isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: _buildColorScheme(brightness),
      textTheme: AppTypography.textTheme,
      appBarTheme: _buildAppBarTheme(textColor, backgroundColor),
      bottomNavigationBarTheme: _buildBottomNavTheme(backgroundColor, textColor),
      cardTheme: _buildCardTheme(cardColor, isDark),
      elevatedButtonTheme: _buildElevatedButtonTheme(isDark),
      outlinedButtonTheme: _buildOutlinedButtonTheme(isDark),
      textButtonTheme: _buildTextButtonTheme(isDark),
      inputDecorationTheme: _buildInputDecorationTheme(isDark, textSecondaryColor),
      floatingActionButtonTheme: _buildFabTheme(isDark),
      dividerTheme: DividerThemeData(
        color: dividerColor,
        thickness: 1,
        space: 0,
      ),
      scaffoldBackgroundColor: backgroundColor,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
      snackBarTheme: _buildSnackBarTheme(isDark),
      dialogTheme: _buildDialogTheme(isDark),
      bottomSheetTheme: _buildBottomSheetTheme(isDark),
    );
  }

  static ColorScheme _buildColorScheme(Brightness brightness) {
    return ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
      primary: AppColors.primary,
      onPrimary: brightness == Brightness.dark ? Colors.black : Colors.white,
      primaryContainer: AppColors.primaryLight,
      onPrimaryContainer:
          brightness == Brightness.dark ? Colors.black : Colors.white,
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      secondaryContainer: AppColors.secondaryLight,
      onSecondaryContainer: Colors.black,
      tertiary: AppColors.accent,
      onTertiary: Colors.black,
      tertiaryContainer: AppColors.accentLight,
      onTertiaryContainer: Colors.black,
      error: AppColors.error,
      onError: Colors.white,
      errorContainer: AppColors.errorLight,
      onErrorContainer: Colors.black,
      surface: brightness == Brightness.dark
          ? AppColors.darkSurface
          : AppColors.lightSurface,
      onSurface: brightness == Brightness.dark
          ? AppColors.darkText
          : AppColors.lightText,
      outline: brightness == Brightness.dark
          ? AppColors.grey700
          : AppColors.grey400,
      surfaceContainerHighest: brightness == Brightness.dark
          ? AppColors.grey900
          : AppColors.grey200,
    );
  }

  static AppBarTheme _buildAppBarTheme(Color textColor, Color backgroundColor) {
    return AppBarTheme(
      elevation: 0,
      centerTitle: true,
      backgroundColor: backgroundColor,
      foregroundColor: textColor,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: AppTypography.titleLarge.copyWith(
        color: textColor,
        fontWeight: FontWeight.w600,
      ),
      iconTheme: IconThemeData(color: textColor),
    );
  }

  static BottomNavigationBarThemeData _buildBottomNavTheme(
    Color backgroundColor,
    Color textColor,
  ) {
    return BottomNavigationBarThemeData(
      backgroundColor: backgroundColor,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: textColor.withOpacity(0.6),
      type: BottomNavigationBarType.fixed,
      elevation: 8,
      selectedLabelStyle: AppTypography.labelSmall,
      unselectedLabelStyle: AppTypography.labelSmall,
    );
  }

  static CardTheme _buildCardTheme(Color color, bool isDark) {
    return CardTheme(
      color: color,
      elevation: isDark ? 0 : AppSpacing.elevationSm,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      margin: const EdgeInsets.all(AppSpacing.cardMargin),
    );
  }

  static ElevatedButtonThemeData _buildElevatedButtonTheme(bool isDark) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: isDark ? Colors.black : Colors.white,
        minimumSize: const Size(double.infinity, AppSpacing.buttonHeightMd),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        textStyle: AppTypography.button,
        elevation: isDark ? 0 : 2,
      ),
    );
  }

  static OutlinedButtonThemeData _buildOutlinedButtonTheme(bool isDark) {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        minimumSize: const Size(double.infinity, AppSpacing.buttonHeightMd),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        side: const BorderSide(color: AppColors.primary, width: 1.5),
        textStyle: AppTypography.button,
      ),
    );
  }

  static TextButtonThemeData _buildTextButtonTheme(bool isDark) {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        minimumSize: const Size(48, AppSpacing.buttonHeightMd),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        textStyle: AppTypography.button,
      ),
    );
  }

  static InputDecorationTheme _buildInputDecorationTheme(
    bool isDark,
    Color hintColor,
  ) {
    final Color fillColor =
        isDark ? AppColors.grey800.withOpacity(0.5) : AppColors.grey100;
    final Color borderColor =
        isDark ? AppColors.grey700 : AppColors.grey400;

    return InputDecorationTheme(
      filled: true,
      fillColor: fillColor,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        borderSide: BorderSide(color: borderColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        borderSide: BorderSide(color: borderColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
      hintStyle: AppTypography.bodyMedium.copyWith(color: hintColor),
      labelStyle: AppTypography.bodyMedium.copyWith(color: hintColor),
      errorStyle: AppTypography.error,
    );
  }

  static FloatingActionButtonThemeData _buildFabTheme(bool isDark) {
    return FloatingActionButtonThemeData(
      backgroundColor: AppColors.primary,
      foregroundColor: isDark ? Colors.black : Colors.white,
      elevation: isDark ? 0 : 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
    );
  }

  static SnackBarThemeData _buildSnackBarTheme(bool isDark) {
    return SnackBarThemeData(
      backgroundColor:
          isDark ? AppColors.grey800 : AppColors.grey900,
      contentTextStyle: AppTypography.bodyMedium.copyWith(
        color: Colors.white,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
      ),
      behavior: SnackBarBehavior.floating,
      elevation: isDark ? 0 : 4,
    );
  }

  static DialogTheme _buildDialogTheme(bool isDark) {
    return DialogTheme(
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      titleTextStyle: AppTypography.titleLarge.copyWith(
        color: isDark ? AppColors.darkText : AppColors.lightText,
      ),
      contentTextStyle: AppTypography.bodyMedium.copyWith(
        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
      ),
    );
  }

  static BottomSheetThemeData _buildBottomSheetTheme(bool isDark) {
    return BottomSheetThemeData(
      backgroundColor:
          isDark ? AppColors.darkSurface : AppColors.lightSurface,
      surfaceTintColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppSpacing.radiusLg),
        ),
      ),
      showDragHandle: true,
      dragHandleColor: isDark ? AppColors.grey600 : AppColors.grey400,
    );
  }
}