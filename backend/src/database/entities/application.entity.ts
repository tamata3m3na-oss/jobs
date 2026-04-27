import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  ApplicationStatus,
  Interview,
  ApplicationAnswer,
} from '@smartjob/shared';
import { JobEntity } from './job.entity';
import { UserEntity } from './user.entity';

@Entity('applications')
@Index(['jobId', 'applicantId'], { unique: true })
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  @Index()
  jobId!: string;

  @ManyToOne(() => JobEntity)
  @JoinColumn({ name: 'jobId' })
  job?: JobEntity;

  @Column('uuid')
  @Index()
  applicantId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'applicantId' })
  applicant?: UserEntity;

  @Column('uuid')
  @Index()
  employerId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'employerId' })
  employer?: UserEntity;

  @Column({
    type: 'enum',
    enum: [
      'SUBMITTED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_EXTENDED',
      'OFFER_ACCEPTED',
      'OFFER_DECLINED',
      'REJECTED',
      'WITHDRAWN',
      'EXPIRED',
    ],
    default: 'SUBMITTED',
  })
  @Index()
  status!: ApplicationStatus;

  @Column('jsonb', { default: [] })
  answers!: ApplicationAnswer[];

  @Column({ nullable: true })
  resumeUrl?: string;

  @Column({ nullable: true })
  coverLetterUrl?: string;

  @Column('jsonb', { default: [] })
  portfolioUrls!: string[];

  @Column('float', { nullable: true })
  matchScore?: number;

  @Column('jsonb', { nullable: true })
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    summary: string;
    recommendation: 'STRONG_APPLY' | 'APPLY' | 'NEUTRAL' | 'SKIP';
  };

  @Column('jsonb', { default: [] })
  interviews!: Interview[];

  @Column('text', { nullable: true })
  notes?: string;

  @Column('jsonb', { default: [] })
  employerNotes!: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: Date;
  }>;

  @Column('text', { nullable: true })
  rejectionReason?: string;

  @Column('jsonb', { nullable: true })
  offeredSalary?: {
    amount: number;
    currency: string;
    period: 'HOURLY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
  };

  @Column('jsonb', {
    default: { type: 'DIRECT' },
  })
  source!: {
    type: 'DIRECT' | 'REFERRAL' | 'LINKEDIN' | 'INDEED' | 'OTHER_JOB_BOARD' | 'SOCIAL_MEDIA' | 'EMAIL';
    referralId?: string;
    utmData?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  };

  @CreateDateColumn()
  submittedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
