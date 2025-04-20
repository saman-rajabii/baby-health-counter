import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ContractionLog } from './contraction-log.entity';

export enum ContractionCounterStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('contractionCounters')
export class ContractionCounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ContractionCounterStatus,
    default: ContractionCounterStatus.ACTIVE,
  })
  status: ContractionCounterStatus;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ContractionLog, (log) => log.counter)
  contractionLogs: ContractionLog[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
