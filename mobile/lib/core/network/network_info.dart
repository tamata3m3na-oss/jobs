import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

abstract class NetworkInfo {
  Future<bool> get isConnected;
  Stream<bool> get onConnectivityChanged;
}

class NetworkInfoImpl implements NetworkInfo {
  final Connectivity connectivity;
  final StreamController<bool> _connectivityController =
      StreamController<bool>.broadcast();

  NetworkInfoImpl(this.connectivity) {
    _initConnectivityListener();
  }

  void _initConnectivityListener() {
    connectivity.onConnectivityChanged.listen((result) {
      final isConnected = result != ConnectivityResult.none;
      _connectivityController.add(isConnected);
    });
  }

  @override
  Future<bool> get isConnected async {
    final result = await connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  @override
  Stream<bool> get onConnectivityChanged => _connectivityController.stream;

  void dispose() {
    _connectivityController.close();
  }
}

/// Stream provider for connectivity changes
final connectivityStreamProvider = StreamProvider<bool>((ref) async* {
  final networkInfo = ref.watch(networkInfoProvider);
  yield await networkInfo.isConnected;
  yield* networkInfo.onConnectivityChanged;
});

/// Provider for network info implementation
final networkInfoProvider = Provider<NetworkInfo>((ref) {
  final connectivity = Connectivity();
  return NetworkInfoImpl(connectivity);
});

/// Simple boolean provider for current connectivity status
final isConnectedProvider = FutureProvider<bool>((ref) async {
  final networkInfo = ref.watch(networkInfoProvider);
  return networkInfo.isConnected;
});
