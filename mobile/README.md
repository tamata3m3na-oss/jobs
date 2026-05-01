# Smart Job Platform - Mobile App

This is the mobile application for the Smart Job Platform, built with Flutter.

## Architecture

The project follows **Clean Architecture** principles, divided into three main layers:

1.  **Data Layer**: Handles data retrieval from remote and local sources.
    - `datasources/`: API clients (Dio/Retrofit).
    - `models/`: Data models with JSON serialization.
    - `repositories/`: Implementations of domain repository interfaces.
2.  **Domain Layer**: Contains the business logic and is independent of any other layer.
    - `entities/`: Core business objects.
    - `repositories/`: Abstract repository interfaces.
    - `usecases/`: Individual business logic units.
3.  **Presentation Layer**: Handles UI and state management.
    - `bloc/`: BLoC state management.
    - `pages/`: Full-screen widgets.
    - `widgets/`: Smaller, reusable UI components.

## Features

- **Auth**: Login and Registration with role-based access.
- **Jobs Map**: "Jobs Near Me" view using Google Maps and Geolocator.
- **Localization**: Full support for English (LTR) and Arabic (RTL).

## Getting Started

### Prerequisites

- Flutter SDK
- Google Maps API Key (Configure in `AndroidManifest.xml` and `AppDelegate.swift`)

### Installation

1.  Navigate to the `mobile` directory:
    ```bash
    cd mobile
    ```
2.  Install dependencies:
    ```bash
    flutter pub get
    ```
3.  Generate models and dependency injection:
    ```bash
    flutter pub run build_runner build --delete-conflicting-outputs
    ```
4.  Run the app:
    ```bash
    flutter run
    ```

## Code Standards

- **Strict Typing**: No `dynamic` types allowed.
- **Linting**: Follows `very_good_analysis` style rules.
- **Clean Code**: Meaningful naming, small functions, and comprehensive documentation.
