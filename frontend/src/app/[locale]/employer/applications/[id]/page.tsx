'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEmployerApplication, useEmployerApplications } from '@/hooks/useEmployerApplications';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  Download,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  User,
  FileText,
  MessageSquare,
  History,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { application, isLoading } = useEmployerApplication(id as string);
  const { updateStatus, isUpdating } = useEmployerApplications();
  const { addToast } = useToast();

  if (isLoading) return <div className="p-8 text-center">Loading application details...</div>;
  if (!application) return <div className="p-8 text-center">Application not found.</div>;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus({ id: id as string, status: newStatus });
      addToast({
        title: 'Status Updated',
        description: `Candidate status changed to ${newStatus.toLowerCase()}.`,
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to update candidate status.',
        variant: 'error',
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Applications
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Profile Summary & Status Actions */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={application.candidatePhoto} />
                <AvatarFallback>{application.candidateName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{application.candidateName}</h2>
              <p className="text-muted-foreground mb-4">{application.candidateEmail}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {application.candidateLocation || 'Remote'}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />{' '}
                  {application.candidateTitle || 'Software Engineer'}
                </Badge>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 mb-6">
                <div className="text-sm font-medium text-primary mb-1">AI Match Score</div>
                <div className="text-4xl font-bold text-primary">{application.matchScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on skills and experience match
                </p>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" /> Message Candidate
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge>{application.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate('SHORTLISTED')}
                  disabled={isUpdating || application.status === 'SHORTLISTED'}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusUpdate('REJECTED')}
                  disabled={isUpdating || application.status === 'REJECTED'}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleStatusUpdate('INTERVIEWING')}
                disabled={isUpdating || application.status === 'INTERVIEWING'}
              >
                <Calendar className="mr-2 h-4 w-4" /> Move to Interview
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Tabs */}
        <div className="w-full lg:w-2/3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {application.coverLetter || 'No cover letter provided.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Application Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.answers?.length > 0 ? (
                    application.answers.map((ans: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-semibold">{ans.question}</p>
                        <p className="text-sm text-muted-foreground">{ans.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No custom questions for this job.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resume" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Candidate Resume
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </CardHeader>
                <CardContent className="h-[600px] bg-muted rounded-md flex items-center justify-center">
                  {application.resumeUrl ? (
                    <iframe
                      src={application.resumeUrl}
                      className="w-full h-full rounded-md"
                      title="Resume Viewer"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Resume not available in preview.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Match Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Skills Match</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experience Match</span>
                      <span className="font-semibold">70%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-2">AI Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {application.aiSummary ||
                        'The candidate shows strong proficiency in React and Node.js, matching 80% of required skills. Their experience in FinTech is a plus, although they have less than the desired 5 years of experience.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Application History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l-2 border-muted space-y-8">
                    {application.history?.map((event: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{event.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{event.note}</p>
                        </div>
                      </div>
                    ))}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Applied</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(application.appliedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Candidate submitted application.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
