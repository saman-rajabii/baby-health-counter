import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1712974001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create extension for UUID generation if it doesn't exist
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create pregnancy_statuses table
    await queryRunner.query(`
      CREATE TABLE "pregnancyStatuses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "week" integer NOT NULL,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_pregnancyStatuses_user" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Create counter_settings table with enum type
    await queryRunner.query(`
      CREATE TYPE "counterTypeEnum" AS ENUM('KICK', 'CONTRACTION')
    `);

    await queryRunner.query(`
      CREATE TABLE "counterSettings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "counterType" "counterTypeEnum" NOT NULL DEFAULT 'KICK',
        "minCount" integer NOT NULL,
        "minPeriod" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create kick_counters table
    await queryRunner.query(`
      CREATE TABLE "kickCounters" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "startedAt" TIMESTAMP NOT NULL,
        "finishedAt" TIMESTAMP,
        "period" integer NOT NULL DEFAULT 2,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_kickCounters_user" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Create kick_logs table
    await queryRunner.query(`
      CREATE TABLE "kickLogs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "happenedAt" TIMESTAMP NOT NULL,
        "counterId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_kickLogs_counter" FOREIGN KEY ("counterId") REFERENCES "kickCounters" ("id") ON DELETE CASCADE
      )
    `);

    // Create contraction_counters table
    await queryRunner.query(`
      CREATE TABLE "contractionCounters" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "startedAt" TIMESTAMP NOT NULL,
        "finishedAt" TIMESTAMP,
        "ongoingContractionStartedAt" TIMESTAMP,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_contractionCounters_user" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE "contractionCounters"`);
    await queryRunner.query(`DROP TABLE "kickLogs"`);
    await queryRunner.query(`DROP TABLE "kickCounters"`);
    await queryRunner.query(`DROP TABLE "counterSettings"`);
    await queryRunner.query(`DROP TYPE "counterTypeEnum"`);
    await queryRunner.query(`DROP TABLE "pregnancyStatuses"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
