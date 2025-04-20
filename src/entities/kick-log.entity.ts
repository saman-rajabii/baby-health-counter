import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KickCounter } from './kick-counter.entity';

@Entity('kickLogs')
export class KickLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', nullable: true })
  happenedAt?: Date;

  @Column()
  counterId: string;

  @ManyToOne(() => KickCounter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'counterId' })
  counter: KickCounter;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
