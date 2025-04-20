import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContractionCounter } from './contraction-counter.entity';

@Entity('contractionLogs')
export class ContractionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz' })
  endedAt: Date;

  @Column({ type: 'int', comment: 'Duration in seconds' })
  duration: number;

  @ManyToOne(() => ContractionCounter, (counter) => counter.contractionLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'counterId' })
  counter: ContractionCounter;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
