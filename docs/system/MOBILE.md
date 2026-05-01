# Mobile Application Documentation

The Smart Job Platform mobile app is built with Flutter, targeting both Android and iOS.

## Architecture

The app follows **Clean Architecture** to ensure testability and maintainability. It is divided into three layers:

### 1. Presentation Layer

- **Widgets**: Reusable UI components and full screens.
- **Providers (Riverpod)**: Manages state and handles UI logic. It interacts with Use Cases to fetch or modify data.
- **State**: Each feature has its own state classes (e.g., `JobState`, `AuthState`).

### 2. Domain Layer

- **Entities**: Simple Dart classes representing the core business models (e.g., `Job`, `User`, `Application`).
- **Repositories (Interfaces)**: Abstract classes defining the contract for data operations.
- **Use Cases**: Encapsulate specific business rules (e.g., `ApplyForJob`, `GetRecommendedJobs`).

### 3. Data Layer

- **Models**: Extensions of Entities with `fromJson` and `toJson` methods for serialization.
- **Repositories (Implementations)**: Concrete implementations of the domain repositories. They decide whether to fetch data from a remote or local source.
- **Data Sources**:
  - **Remote**: Handles API calls using `Dio`.
  - **Local**: Handles persistence using `shared_preferences` or `sqflite`.

## Key Technologies

- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Networking**: Dio
- **Dependency Injection**: Integrated with Riverpod
- **Localization**: flutter_localizations (ARB files)
- **JSON Serialization**: json_serializable

## Feature Modules

### 1. Auth

- Login and Registration.
- Secure storage of JWT tokens.
- Role-based UI branching (Job Seeker vs. Employer).

### 2. Jobs

- Job listing with infinite scroll.
- Advanced filtering and search.
- Geospatial search (using user's current location).
- Job details with AI match score.

### 3. Profile

- Profile editing.
- Resume upload.
- Viewing application history.

## Development Setup

1. **Prerequisites**:
   - Flutter SDK installed.
   - Android Studio or VS Code with Flutter extension.
2. **Installation**:
   ```bash
   cd mobile
   flutter pub get
   ```
3. **Running the App**:
   ```bash
   flutter run
   ```
4. **Code Generation** (for models):
   ```bash
   flutter pub run build_runner build
   ```

## Testing

- **Unit Tests**: Test Use Cases and Repositories (`test/`).
- **Widget Tests**: Test individual UI components.
- **Integration Tests**: Test full user flows on a real device or emulator.
