import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { KickCounter } from './kick-counter.entity';
import { ContractionCounter } from './contraction-counter.entity';
import { PregnancyStatus } from './pregnancy-status.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => KickCounter, (kickCounter) => kickCounter.user)
  kickCounters: KickCounter[];

  @OneToMany(
    () => ContractionCounter,
    (contractionCounter) => contractionCounter.user,
  )
  contractionCounters: ContractionCounter[];

  @OneToMany(() => PregnancyStatus, (pregnancyStatus) => pregnancyStatus.user)
  pregnancyStatuses: PregnancyStatus[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
