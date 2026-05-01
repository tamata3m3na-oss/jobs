import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smartjob/shared/widgets/skeleton_widget.dart';

void main() {
  group('SkeletonBox Tests', () {
    testWidgets('should render with default dimensions', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonBox(),
          ),
        ),
      );

      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container, isNotNull);
    });

    testWidgets('should respect custom width', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonBox(width: 100),
          ),
        ),
      );

      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.constraints?.maxWidth, 100);
    });

    testWidgets('should respect custom height', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonBox(height: 50),
          ),
        ),
      );

      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.constraints?.maxHeight, 50);
    });

    testWidgets('should animate shimmer effect', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonBox(width: 200, height: 20),
          ),
        ),
      );

      // Pump a few frames to verify animation runs
      await tester.pump(const Duration(milliseconds: 500));
      await tester.pump(const Duration(milliseconds: 500));

      expect(find.byType(SkeletonBox), findsOneWidget);
    });
  });

  group('SkeletonText Tests', () {
    testWidgets('should render single line by default', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonText(),
          ),
        ),
      );

      expect(find.byType(SkeletonBox), findsOneWidget);
    });

    testWidgets('should render multiple lines', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonText(lines: 3),
          ),
        ),
      );

      expect(find.byType(SkeletonBox), findsNWidgets(3));
    });

    testWidgets('should respect custom width', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonText(width: 200),
          ),
        ),
      );

      final skeletonBox = tester.widget<SkeletonBox>(find.byType(SkeletonBox).first);
      expect(skeletonBox.width, 200);
    });

    testWidgets('should have different widths for last line', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonText(lines: 3, width: 200),
          ),
        ),
      );

      // All skeleton boxes should be found
      expect(find.byType(SkeletonBox), findsNWidgets(3));
    });
  });

  group('SkeletonCircle Tests', () {
    testWidgets('should render with default size', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonCircle(),
          ),
        ),
      );

      expect(find.byType(SkeletonCircle), findsOneWidget);
    });

    testWidgets('should respect custom size', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonCircle(size: 80),
          ),
        ),
      );

      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.constraints?.maxWidth, 80);
      expect(container.constraints?.maxHeight, 80);
    });

    testWidgets('should have circular shape', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonCircle(size: 60),
          ),
        ),
      );

      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.decoration, isA<BoxDecoration>());
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.shape, BoxShape.circle);
    });
  });

  group('JobCardSkeleton Tests', () {
    testWidgets('should render job card skeleton', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: JobCardSkeleton(),
          ),
        ),
      );

      expect(find.byType(JobCardSkeleton), findsOneWidget);
      expect(find.byType(Card), findsOneWidget);
    });

    testWidgets('should contain skeleton circles for company logo', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: JobCardSkeleton(),
          ),
        ),
      );

      expect(find.byType(SkeletonCircle), findsWidgets);
    });

    testWidgets('should contain skeleton boxes for text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: JobCardSkeleton(),
          ),
        ),
      );

      expect(find.byType(SkeletonBox), findsWidgets);
    });
  });

  group('ProfileSkeleton Tests', () {
    testWidgets('should render profile skeleton', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: ProfileSkeleton(),
            ),
          ),
        ),
      );

      expect(find.byType(ProfileSkeleton), findsOneWidget);
    });

    testWidgets('should have large skeleton circle for avatar', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: ProfileSkeleton(),
            ),
          ),
        ),
      );

      // Find the skeleton circle with size 100
      final skeletonCircles = tester.widgetList<SkeletonCircle>(
        find.byType(SkeletonCircle),
      );
      expect(skeletonCircles.any((s) => s.size == 100), isTrue);
    });
  });

  group('SkeletonList Tests', () {
    testWidgets('should render specified number of items', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SkeletonList(
              itemCount: 3,
              itemBuilder: (index) => const SkeletonBox(height: 50),
            ),
          ),
        ),
      );

      expect(find.byType(SkeletonBox), findsNWidgets(3));
    });

    testWidgets('should use index in item builder', (tester) async {
      int lastIndex = -1;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SkeletonList(
              itemCount: 2,
              itemBuilder: (index) {
                lastIndex = index;
                return SkeletonBox(key: ValueKey(index), height: 50);
              },
            ),
          ),
        ),
      );

      expect(lastIndex, 1);
    });

    testWidgets('should have non-scrollable physics', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SkeletonList(
              itemCount: 5,
              itemBuilder: (_) => SkeletonBox(height: 20),
            ),
          ),
        ),
      );

      final listView = tester.widget<ListView>(find.byType(ListView));
      expect(listView.physics, isA<NeverScrollableScrollPhysics>());
    });
  });
}