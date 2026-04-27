import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  JobType,
  JobStatus,
  ExperienceLevel,
  Salary,
  Benefits,
  JobApplicationQuestion,
} from '@smartjob/shared';

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  @Index()
  employerId!: string;

  @Column()
  @Index()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column('text')
  description!: string;

  @Column('text')
  shortDescription!: string;

  @Column('jsonb', { default: [] })
  requirements!: string[];

  @Column('jsonb', { default: [] })
  responsibilities!: string[];

  @Column('jsonb', { default: [] })
  niceToHave!: string[];

  @Column('jsonb', { default: [] })
  skills!: string[];

  @Column({
    type: 'enum',
    enum: [
      'FULL_TIME',
      'PART_TIME',
      'CONTRACT',
      'INTERNSHIP',
      'TEMPORARY',
      'VOLUNTEER',
    ],
  })
  @Index()
  jobType!: JobType;

  @Column({
    type: 'enum',
    enum: ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'],
    default: 'MID',
  })
  @Index()
  experienceLevel!: ExperienceLevel;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  location!: { type: 'Point'; coordinates: [number, number] };

  @Column('jsonb', { nullable: true })
  locationDetails!: {
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    isRemote: boolean;
    remoteOptions: 'FULLY_REMOTE' | 'HYBRID' | 'ONSITE';
    travelRequirements?: string;
  };

  @Column('jsonb', { nullable: true })
  salary?: Salary;

  @Column('jsonb', { default: {} })
  benefits!: Benefits;

  @Column('jsonb', { default: [] })
  applicationQuestions!: JobApplicationQuestion[];

  @Column({ type: 'timestamp', nullable: true })
  applicationDeadline?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ default: 1 })
  openings!: number;

  @Column({
    type: 'enum',
    enum: [
      'DRAFT',
      'PENDING_APPROVAL',
      'ACTIVE',
      'PAUSED',
      'EXPIRED',
      'CLOSED',
      'REJECTED',
    ],
    default: 'DRAFT',
  })
  @Index()
  status!: JobStatus;

  @Column({ default: false })
  featured!: boolean;

  @Column({ default: 0 })
  views!: number;

  @Column({ default: 0 })
  applicationsCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ default: false })
  aiGeneratedDescription!: boolean;

  @Column('jsonb', { default: [] })
  screeningCriteria!: Array<{
    id: string;
    name: string;
    weight: number;
    type:
      | 'SKILL'
      | 'EXPERIENCE'
      | 'EDUCATION'
      | 'CERTIFICATION'
      | 'LANGUAGE'
      | 'CUSTOM';
  }>;

  @Column('jsonb', { default: {} })
  matchSettings!: {
    enableAiMatching: boolean;
    minMatchScore: number;
    autoSuggestCandidates: boolean;
    blindHiring: boolean;
  };
}
