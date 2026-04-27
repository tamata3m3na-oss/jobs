import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../bloc/job_bloc.dart';
import '../bloc/job_event.dart';
import '../bloc/job_state.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class JobsMapPage extends StatefulWidget {
  const JobsMapPage({super.key});

  @override
  State<JobsMapPage> createState() => _JobsMapPageState();
}

class _JobsMapPageState extends State<JobsMapPage> {
  GoogleMapController? _mapController;
  LatLng _currentPosition = const LatLng(24.7136, 46.6753); // Default to Riyadh

  @override
  void initState() {
    super.initState();
    _determinePosition().then((position) {
      setState(() {
        _currentPosition = LatLng(position.latitude, position.longitude);
      });
      context.read<JobBloc>().add(
            LoadNearbyJobs(
              latitude: position.latitude,
              longitude: position.longitude,
            ),
          );
    });
  }

  Future<Position> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    return await Geolocator.getCurrentPosition();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.jobsNearMe)),
      body: BlocBuilder<JobBloc, JobState>(
        builder: (context, state) {
          Set<Marker> markers = {};
          if (state is JobsLoaded) {
            markers = state.jobs.map((job) {
              return Marker(
                markerId: MarkerId(job.id),
                position: LatLng(job.latitude, job.longitude),
                infoWindow: InfoWindow(title: job.title, snippet: job.companyName),
              );
            }).toSet();
          }

          return GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _currentPosition,
              zoom: 12,
            ),
            onMapCreated: (controller) => _mapController = controller,
            markers: markers,
            myLocationEnabled: true,
          );
        },
      ),
    );
  }
}
