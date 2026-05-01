import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/services/applications_service.dart';
import '../../../core/di/injection.dart';
import '../../shared/widgets/loading_widget.dart';

/// Apply to job page
class ApplyPage extends ConsumerStatefulWidget {
  final String jobId;

  const ApplyPage({super.key, required this.jobId});

  @override
  ConsumerState<ApplyPage> createState() => _ApplyPageState();
}

class _ApplyPageState extends ConsumerState<ApplyPage> {
  final _formKey = GlobalKey<FormState>();
  final _coverLetterController = TextEditingController();
  bool _isLoading = false;
  bool _hasApplied = false;

  @override
  void initState() {
    super.initState();
    _checkApplicationStatus();
  }

  Future<void> _checkApplicationStatus() async {
    try {
      final applicationsService = ApplicationsService(apiClient: ref.read(apiClientProvider));
      final hasApplied = await applicationsService.hasApplied(widget.jobId);
      if (mounted) {
        setState(() => _hasApplied = hasApplied);
      }
    } catch (_) {
      // Ignore errors
    }
  }

  @override
  void dispose() {
    _coverLetterController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Apply for Job'),
      ),
      body: _hasApplied
          ? _buildAlreadyApplied()
          : _buildApplicationForm(),
    );
  }

  Widget _buildAlreadyApplied() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle,
              size: 80,
              color: Colors.green,
            ),
            const SizedBox(height: 24),
            Text(
              'Already Applied',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'You have already submitted an application for this job.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                  ),
            ),
            const SizedBox(height: 32),
            OutlinedButton(
              onPressed: () => context.pop(),
              child: const Text('Back to Job'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildApplicationForm() {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Cover letter section
          Text(
            'Cover Letter (Optional)',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tell the employer why you\'re a great fit for this role.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _coverLetterController,
            maxLines: 8,
            decoration: InputDecoration(
              hintText: 'Write your cover letter here...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 32),

          // Resume note
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Your profile will be shared with the employer as your application.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),

          // Submit button
          if (_isLoading)
            const LoadingWidget(message: 'Submitting application...')
          else
            ElevatedButton(
              onPressed: _handleSubmit,
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 4),
                child: Text('Submit Application'),
              ),
            ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleSubmit() async {
    setState(() => _isLoading = true);

    try {
      final applicationsService = ApplicationsService(apiClient: ref.read(apiClientProvider));
      await applicationsService.applyToJob(
        jobId: widget.jobId,
        coverLetter: _coverLetterController.text.isNotEmpty
            ? _coverLetterController.text
            : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Application submitted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/jobs');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit application: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}