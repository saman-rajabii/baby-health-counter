import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CounterType {
  KICK = 'KICK',
  CONTRACTION = 'CONTRACTION',
}

@Entity('counterSettings')
export class CounterSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CounterType,
    default: CounterType.KICK,
  })
  counterType: CounterType;

  @Column({ type: 'int' })
  minCount: number;

  @Column({ type: 'int', comment: 'Period in minutes' })
  minPeriod: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
