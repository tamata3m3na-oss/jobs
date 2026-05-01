/// Application spacing system for consistent layout
/// All values in logical pixels (density-independent)
class AppSpacing {
  AppSpacing._();

  // Base unit (4dp)
  static const double unit = 4.0;

  // Spacing scale
  static const double xxs = 2.0;    // 2px - tight spacing
  static const double xs = 4.0;     // 4px - minimal spacing
  static const double sm = 8.0;     // 8px - small spacing
  static const double md = 12.0;    // 12px - medium spacing
  static const double base = 16.0;  // 16px - base spacing
  static const double lg = 24.0;    // 24px - large spacing
  static const double xl = 32.0;    // 32px - extra large
  static const double xxl = 48.0;   // 48px - section spacing
  static const double xxxl = 64.0;  // 64px - major sections

  // Padding helpers
  static const double paddingXxs = xxs;
  static const double paddingXs = xs;
  static const double paddingSm = sm;
  static const double paddingMd = md;
  static const double paddingBase = base;
  static const double paddingLg = lg;
  static const double paddingXl = xl;
  static const double paddingXxl = xxl;
  static const double paddingXxxl = xxxl;

  // Margin helpers
  static const double marginXxs = xxs;
  static const double marginXs = xs;
  static const double marginSm = sm;
  static const double marginMd = md;
  static const double marginBase = base;
  static const double marginLg = lg;
  static const double marginXl = xl;
  static const double marginXxl = xxl;
  static const double marginXxxl = xxxl;

  // Screen padding
  static const double screenPaddingHorizontal = base;
  static const double screenPaddingVertical = lg;

  // Card padding
  static const double cardPadding = md;
  static const double cardMargin = sm;

  // List item spacing
  static const double listItemSpacing = sm;
  static const double listSectionSpacing = lg;

  // Border radius
  static const double radiusXs = 4.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 9999.0;

  // Icon sizes
  static const double iconXs = 16.0;
  static const double iconSm = 20.0;
  static const double iconMd = 24.0;
  static const double iconLg = 32.0;
  static const double iconXl = 48.0;

  // Button heights
  static const double buttonHeightSm = 36.0;
  static const double buttonHeightMd = 48.0;
  static const double buttonHeightLg = 56.0;

  // Input field heights
  static const double inputHeight = 56.0;

  // App bar height
  static const double appBarHeight = 56.0;

  // Bottom navigation height
  static const double bottomNavHeight = 80.0;

  // Card elevation
  static const double elevationSm = 2.0;
  static const double elevationMd = 4.0;
  static const double elevationLg = 8.0;

  // Grid spacing
  static const double gridGutter = base;
  static const double gridMargin = lg;
}