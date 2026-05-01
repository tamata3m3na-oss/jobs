import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../auth/presentation/providers/auth_provider.dart';
import '../providers/jobs_provider.dart';

class ApplyPage extends ConsumerStatefulWidget {
  final String jobId;

  const ApplyPage({super.key, required this.jobId});

  @override
  ConsumerState<ApplyPage> createState() => _ApplyPageState();
}

class _ApplyPageState extends ConsumerState<ApplyPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  final _phoneController = TextEditingController();
  final _coverLetterController = TextEditingController();
  PlatformFile? _resumeFile;

  @override
  void initState() {
    super.initState();
    final user = ref.read(currentUserProvider);
    _nameController = TextEditingController(text: user?.fullName);
    _emailController = TextEditingController(text: user?.email);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _coverLetterController.dispose();
    super.dispose();
  }

  Future<void> _pickResume() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
    );

    if (result != null) {
      setState(() {
        _resumeFile = result.files.first;
      });
    }
  }

  void _submitApplication() async {
    if (!_formKey.currentState!.validate()) return;
    if (_resumeFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload your resume')),
      );
      return;
    }

    await ref.read(applyToJobProvider.notifier).apply(
      jobId: widget.jobId,
      coverLetter: _coverLetterController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final applyState = ref.watch(applyToJobProvider);
    final jobAsync = ref.watch(jobDetailProvider(widget.jobId));

    ref.listen(applyToJobProvider, (previous, next) {
      next.maybeWhen(
        success: (data, message, statusCode) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Application submitted successfully!'),
              backgroundColor: AppColors.success500,
            ),
          );
          context.go('/jobs');
        },
        failure: (failure, statusCode) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(failure.message),
              backgroundColor: AppColors.error500,
            ),
          );
        },
        orElse: () {},
      );
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Apply for Job'),
      ),
      body: applyState.maybeWhen(
        loading: () => const LoadingWidget(message: 'Submitting your application...'),
        orElse: () => SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.l),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                jobAsync.when(
                  data: (job) => _buildJobSummary(job),
                  loading: () => const LinearProgressIndicator(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text('Personal Information', style: AppTypography.h3),
                const SizedBox(height: AppSpacing.m),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Please enter your name' : null,
                ),
                const SizedBox(height: AppSpacing.m),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Please enter your email' : null,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: AppSpacing.m),
                TextFormField(
                  controller: _phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Please enter your phone number' : null,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: AppSpacing.xl),
                Text('Application', style: AppTypography.h3),
                const SizedBox(height: AppSpacing.m),
                TextFormField(
                  controller: _coverLetterController,
                  decoration: const InputDecoration(
                    labelText: 'Cover Letter',
                    alignLabelWithHint: true,
                    hintText: 'Tell the employer why you are a good fit...',
                  ),
                  maxLines: 5,
                ),
                const SizedBox(height: AppSpacing.l),
                Text('Resume', style: AppTypography.h4),
                const SizedBox(height: AppSpacing.s),
                InkWell(
                  onTap: _pickResume,
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.l),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.neutral300, style: BorderStyle.solid),
                      borderRadius: BorderRadius.circular(AppSpacing.s),
                      color: AppColors.neutral50,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.upload_file, color: AppColors.primary600),
                        const SizedBox(width: AppSpacing.s),
                        Text(
                          _resumeFile?.name ?? 'Upload Resume (PDF, DOCX)',
                          style: TextStyle(
                            color: _resumeFile != null ? AppColors.neutral900 : AppColors.neutral500,
                            fontWeight: _resumeFile != null ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl * 2),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _submitApplication,
                    child: const Text('Submit Application'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildJobSummary(JobModel job) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.m),
      decoration: BoxDecoration(
        color: AppColors.primary50,
        borderRadius: BorderRadius.circular(AppSpacing.m),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppSpacing.s),
            ),
            child: job.companyLogo != null
                ? Image.network(job.companyLogo!, errorBuilder: (_, __, ___) => const Icon(Icons.business))
                : const Icon(Icons.business, color: AppColors.primary600),
          ),
          const SizedBox(width: AppSpacing.m),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(job.title, style: AppTypography.h4),
                Text(job.companyName, style: AppTypography.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
