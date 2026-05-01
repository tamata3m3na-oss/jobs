import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smartjob/shared/widgets/error_widget.dart';

void main() {
  group('ErrorDisplayWidget Tests', () {
    testWidgets('should display error message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'Something went wrong',
            ),
          ),
        ),
      );

      expect(find.text('Something went wrong'), findsOneWidget);
    });

    testWidgets('should display custom title', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'Error occurred',
              title: 'Error Title',
            ),
          ),
        ),
      );

      expect(find.text('Error Title'), findsOneWidget);
      expect(find.text('Error occurred'), findsOneWidget);
    });

    testWidgets('should display error icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'Error',
              icon: Icons.error,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.error), findsOneWidget);
    });

    testWidgets('should show retry button when onRetry provided', (tester) async {
      bool retryPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'Error',
              onRetry: () => retryPressed = true,
            ),
          ),
        ),
      );

      expect(find.text('Retry'), findsOneWidget);

      await tester.tap(find.text('Retry'));
      await tester.pump();

      expect(retryPressed, isTrue);
    });

    testWidgets('should not show retry button when onRetry is null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'Error',
            ),
          ),
        ),
      );

      expect(find.text('Retry'), findsNothing);
    });
  });

  group('NetworkErrorWidget Tests', () {
    testWidgets('should display network error message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NetworkErrorWidget(),
          ),
        ),
      );

      expect(find.text('No Internet Connection'), findsOneWidget);
      expect(find.text('Please check your network connection and try again.'), findsOneWidget);
    });

    testWidgets('should display custom message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NetworkErrorWidget(
              customMessage: 'Custom network error message',
            ),
          ),
        ),
      );

      expect(find.text('Custom network error message'), findsOneWidget);
    });

    testWidgets('should display wifi off icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: NetworkErrorWidget(),
          ),
        ),
      );

      expect(find.byIcon(Icons.wifi_off), findsOneWidget);
    });

    testWidgets('should show retry button', (tester) async {
      bool retryPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: NetworkErrorWidget(
              onRetry: () => retryPressed = true,
            ),
          ),
        ),
      );

      expect(find.text('Try Again'), findsOneWidget);

      await tester.tap(find.text('Try Again'));
      await tester.pump();

      expect(retryPressed, isTrue);
    });
  });

  group('EmptyStateWidget Tests', () {
    testWidgets('should display title and message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              title: 'No Jobs Found',
              message: 'Try adjusting your search criteria',
            ),
          ),
        ),
      );

      expect(find.text('No Jobs Found'), findsOneWidget);
      expect(find.text('Try adjusting your search criteria'), findsOneWidget);
    });

    testWidgets('should display custom icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              title: 'Empty',
              icon: Icons.inbox,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.inbox), findsOneWidget);
    });

    testWidgets('should show action button when actionLabel provided', (tester) async {
      bool actionPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              title: 'No data',
              actionLabel: 'Refresh',
              onAction: () => actionPressed = true,
            ),
          ),
        ),
      );

      expect(find.text('Refresh'), findsOneWidget);

      await tester.tap(find.text('Refresh'));
      await tester.pump();

      expect(actionPressed, isTrue);
    });

    testWidgets('should show custom action widget', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              title: 'Empty',
              action: ElevatedButton(
                onPressed: null,
                child: Text('Custom Action'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Custom Action'), findsOneWidget);
    });
  });

  group('ServerErrorWidget Tests', () {
    testWidgets('should display server error message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ServerErrorWidget(),
          ),
        ),
      );

      expect(find.text('Server Error'), findsOneWidget);
      expect(find.text('We\'re experiencing technical difficulties. Please try again later.'), findsOneWidget);
    });

    testWidgets('should display custom status code message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ServerErrorWidget(statusCode: 503),
          ),
        ),
      );

      expect(find.text('Server Error'), findsOneWidget);
      expect(find.text('Something went wrong on our end. We\'re working to fix it.'), findsOneWidget);
    });

    testWidgets('should display cloud off icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ServerErrorWidget(),
          ),
        ),
      );

      expect(find.byIcon(Icons.cloud_off), findsOneWidget);
    });

    testWidgets('should show retry button', (tester) async {
      bool retryPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ServerErrorWidget(
              onRetry: () => retryPressed = true,
            ),
          ),
        ),
      );

      expect(find.text('Try Again'), findsOneWidget);

      await tester.tap(find.text('Try Again'));
      await tester.pump();

      expect(retryPressed, isTrue);
    });
  });

  group('FailureWidget Tests', () {
    testWidgets('should show network error for network related messages', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: FailureWidget(
              message: 'Network connection failed',
              code: 'NETWORK_ERROR',
            ),
          ),
        ),
      );

      expect(find.text('No Internet Connection'), findsOneWidget);
      expect(find.byIcon(Icons.wifi_off), findsOneWidget);
    });

    testWidgets('should show server error for server related messages', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: FailureWidget(
              message: 'Internal server error',
              code: 'SERVER_ERROR',
            ),
          ),
        ),
      );

      expect(find.text('Server Error'), findsOneWidget);
    });

    testWidgets('should show empty state for not found messages', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: FailureWidget(
              message: 'Resource not found',
              code: 'NOT_FOUND',
            ),
          ),
        ),
      );

      expect(find.text('No Data'), findsOneWidget);
      expect(find.byIcon(Icons.search_off), findsOneWidget);
    });

    testWidgets('should show generic error for unknown errors', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: FailureWidget(
              message: 'Unknown error occurred',
            ),
          ),
        ),
      );

      expect(find.text('Something Went Wrong'), findsOneWidget);
    });
  });
}