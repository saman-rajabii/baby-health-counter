import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitialData1712974002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed a demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await queryRunner.query(
      `
      INSERT INTO "users" ("name", "email", "password")
      VALUES ('Demo User', 'demo@example.com', $1)
    `,
      [hashedPassword],
    );

    // Get the user ID
    const result = await queryRunner.query(`
      SELECT "id" FROM "users" WHERE "email" = 'demo@example.com'
    `);
    const userId = result[0].id;

    // Seed pregnancy status
    await queryRunner.query(
      `
      INSERT INTO "pregnancyStatuses" ("week", "userId")
      VALUES (25, $1)
    `,
      [userId],
    );

    // Seed counter settings
    await queryRunner.query(`
      INSERT INTO "counterSettings" ("counterType", "minCount", "minPeriod")
      VALUES ('KICK', 10, 120), ('CONTRACTION', 3, 60)
    `);

    // Seed a kick counter
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    await queryRunner.query(
      `
      INSERT INTO "kickCounters" ("startedAt", "finishedAt", "period", "userId")
      VALUES ($1, $2, 2, $3)
    `,
      [oneHourAgo.toISOString(), now.toISOString(), userId],
    );

    // Get the kick counter ID
    const kickCounterResult = await queryRunner.query(
      `
      SELECT "id" FROM "kickCounters" WHERE "userId" = $1 LIMIT 1
    `,
      [userId],
    );
    const kickCounterId = kickCounterResult[0].id;

    // Seed kick logs (10 kicks in the last hour)
    for (let i = 0; i < 10; i++) {
      const kickTime = new Date(oneHourAgo.getTime() + i * 360000); // Roughly every 6 minutes
      await queryRunner.query(
        `
        INSERT INTO "kickLogs" ("happenedAt", "counterId")
        VALUES ($1, $2)
      `,
        [kickTime.toISOString(), kickCounterId],
      );
    }

    // Seed a contraction counter
    const twoHoursAgo = new Date(now.getTime() - 7200000);
    await queryRunner.query(
      `
      INSERT INTO "contractionCounters" ("startedAt", "userId")
      VALUES ($1, $2)
    `,
      [twoHoursAgo.toISOString(), userId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all seeded data
    await queryRunner.query(`DELETE FROM "contractionCounters"`);
    await queryRunner.query(`DELETE FROM "kickLogs"`);
    await queryRunner.query(`DELETE FROM "kickCounters"`);
    await queryRunner.query(`DELETE FROM "counterSettings"`);
    await queryRunner.query(`DELETE FROM "pregnancyStatuses"`);
    await queryRunner.query(
      `DELETE FROM "users" WHERE "email" = 'demo@example.com'`,
    );
  }
}
