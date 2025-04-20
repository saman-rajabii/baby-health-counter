import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedData1713000100000 implements MigrationInterface {
  name = 'SeedData1713000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await queryRunner.query(`
      INSERT INTO "users" ("name", "email", "password", "isActive")
      VALUES ('Demo User', 'demo@example.com', '${hashedPassword}', true)
      RETURNING "id"
    `);
    const userId = demoUser[0].id;

    // Create a pregnancy status for the demo user
    await queryRunner.query(`
      INSERT INTO "pregnancyStatuses" ("week", "userId")
      VALUES (24, '${userId}')
    `);

    // Make sure counter settings exist (in case initial migration didn't run)
    const counterSettingsCount = await queryRunner.query(
      `SELECT COUNT(*) FROM "counterSettings"`,
    );

    if (parseInt(counterSettingsCount[0].count) === 0) {
      await queryRunner.query(`
        INSERT INTO "counterSettings" ("counterType", "minCount", "minPeriod")
        VALUES 
          ('KICK', 10, 120),
          ('CONTRACTION', 3, 60)
      `);
    }

    // Create a completed kick counter with logs
    const kickCounterDate = new Date();
    kickCounterDate.setDate(kickCounterDate.getDate() - 1); // Yesterday

    const startedAt = new Date(kickCounterDate);
    const finishedAt = new Date(kickCounterDate);
    finishedAt.setHours(finishedAt.getHours() + 2); // 2 hours later

    const kickCounter = await queryRunner.query(`
      INSERT INTO "kickCounters" ("startedAt", "finishedAt", "period", "userId")
      VALUES ('${startedAt.toISOString()}', '${finishedAt.toISOString()}', 2, '${userId}')
      RETURNING "id"
    `);
    const kickCounterId = kickCounter[0].id;

    // Create 12 kick logs (above the minimum of 10)
    for (let i = 0; i < 12; i++) {
      const happenedAt = new Date(startedAt);
      happenedAt.setMinutes(happenedAt.getMinutes() + i * 10); // Every 10 minutes

      await queryRunner.query(`
        INSERT INTO "kickLogs" ("happenedAt", "counterId")
        VALUES ('${happenedAt.toISOString()}', '${kickCounterId}')
      `);
    }

    // Create an active kick counter with a few logs
    const activeKickCounter = await queryRunner.query(`
      INSERT INTO "kickCounters" ("startedAt", "finishedAt", "period", "userId")
      VALUES (NOW(), NULL, 2, '${userId}')
      RETURNING "id"
    `);
    const activeKickCounterId = activeKickCounter[0].id;

    // Create 3 kick logs for the active counter
    for (let i = 0; i < 3; i++) {
      const happenedAt = new Date();
      happenedAt.setMinutes(happenedAt.getMinutes() - i * 5); // Every 5 minutes ago

      await queryRunner.query(`
        INSERT INTO "kickLogs" ("happenedAt", "counterId")
        VALUES ('${happenedAt.toISOString()}', '${activeKickCounterId}')
      `);
    }

    // Create a completed contraction counter with logs
    const contractionDate = new Date();
    contractionDate.setDate(contractionDate.getDate() - 2); // Two days ago

    const contractionCounter = await queryRunner.query(`
      INSERT INTO "contractionCounters" ("status", "userId")
      VALUES ('closed', '${userId}')
      RETURNING "id"
    `);
    const contractionCounterId = contractionCounter[0].id;

    // Create 5 contraction logs (above the minimum of 3)
    for (let i = 0; i < 5; i++) {
      const startTime = new Date(contractionDate);
      startTime.setMinutes(startTime.getMinutes() + i * 12); // Every 12 minutes

      const endTime = new Date(startTime);
      endTime.setSeconds(
        endTime.getSeconds() + 45 + Math.floor(Math.random() * 30),
      ); // 45-75 seconds duration

      const duration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000,
      );

      await queryRunner.query(`
        INSERT INTO "contractionLogs" ("startedAt", "endedAt", "duration", "counterId")
        VALUES ('${startTime.toISOString()}', '${endTime.toISOString()}', ${duration}, '${contractionCounterId}')
      `);
    }

    // Create an active contraction counter with a few logs
    const activeContractionCounter = await queryRunner.query(`
      INSERT INTO "contractionCounters" ("status", "userId")
      VALUES ('active', '${userId}')
      RETURNING "id"
    `);
    const activeContractionCounterId = activeContractionCounter[0].id;

    // Create 2 contraction logs for the active counter
    for (let i = 0; i < 2; i++) {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - i * 15 - 5); // 5 and 20 minutes ago

      const endTime = new Date(startTime);
      endTime.setSeconds(endTime.getSeconds() + 60); // 60 seconds duration

      await queryRunner.query(`
        INSERT INTO "contractionLogs" ("startedAt", "endedAt", "duration", "counterId")
        VALUES ('${startTime.toISOString()}', '${endTime.toISOString()}', 60, '${activeContractionCounterId}')
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First get the demo user ID
    const demoUser = await queryRunner.query(`
      SELECT "id" FROM "users" WHERE "email" = 'demo@example.com'
    `);

    if (demoUser.length > 0) {
      const userId = demoUser[0].id;

      // Delete all associated data in reverse order of dependencies

      // Delete contraction logs (via their counters)
      await queryRunner.query(`
        DELETE FROM "contractionCounters" WHERE "userId" = '${userId}'
      `);

      // Delete kick logs (via their counters)
      await queryRunner.query(`
        DELETE FROM "kickCounters" WHERE "userId" = '${userId}'
      `);

      // Delete pregnancy statuses
      await queryRunner.query(`
        DELETE FROM "pregnancyStatuses" WHERE "userId" = '${userId}'
      `);

      // Delete the user
      await queryRunner.query(`
        DELETE FROM "users" WHERE "id" = '${userId}'
      `);
    }

    // We don't delete the counter settings since they're part of the application configuration
  }
}
