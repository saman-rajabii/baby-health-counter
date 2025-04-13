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

  @Column({ type: 'timestamp' })
  happenedAt: Date;

  @Column()
  counterId: string;

  @ManyToOne(() => KickCounter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'counterId' })
  counter: KickCounter;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
