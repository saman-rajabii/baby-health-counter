import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateContractionCounterEntity1712989001000
  implements MigrationInterface
{
  name = 'UpdateContractionCounterEntity1712989001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for status
    await queryRunner.query(
      `CREATE TYPE "public"."contraction_counter_status_enum" AS ENUM('active', 'closed')`,
    );

    // Add status column with default value 'active'
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" ADD "status" "public"."contraction_counter_status_enum" NOT NULL DEFAULT 'active'`,
    );

    // Update existing records based on finishedAt
    await queryRunner.query(
      `UPDATE "contractionCounters" SET "status" = 'closed' WHERE "finishedAt" IS NOT NULL`,
    );

    // Check if ongoingContractionStartedAt and hasOngoingContraction columns exist
    const hasOngingContractionStartedAt = await this.columnExists(
      queryRunner,
      'contractionCounters',
      'ongoingContractionStartedAt',
    );
    const hasHasOngoingContraction = await this.columnExists(
      queryRunner,
      'contractionCounters',
      'hasOngoingContraction',
    );

    // Drop startedAt and finishedAt columns
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" DROP COLUMN "startedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" DROP COLUMN "finishedAt"`,
    );

    // Drop other columns if they exist
    if (hasOngingContractionStartedAt) {
      await queryRunner.query(
        `ALTER TABLE "contractionCounters" DROP COLUMN "ongoingContractionStartedAt"`,
      );
    }

    if (hasHasOngoingContraction) {
      await queryRunner.query(
        `ALTER TABLE "contractionCounters" DROP COLUMN "hasOngoingContraction"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the original columns
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" ADD "startedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" ADD "finishedAt" TIMESTAMP NULL`,
    );

    // Update startedAt to match createdAt for all records
    await queryRunner.query(
      `UPDATE "contractionCounters" SET "startedAt" = "createdAt"`,
    );

    // Update finishedAt for closed counters
    await queryRunner.query(
      `UPDATE "contractionCounters" SET "finishedAt" = "updatedAt" WHERE "status" = 'closed'`,
    );

    // Add back ongoingContractionStartedAt and hasOngoingContraction if they were removed
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" ADD "ongoingContractionStartedAt" TIMESTAMP NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" ADD "hasOngoingContraction" BOOLEAN NOT NULL DEFAULT false`,
    );

    // Drop the status column
    await queryRunner.query(
      `ALTER TABLE "contractionCounters" DROP COLUMN "status"`,
    );

    // Drop the enum type
    await queryRunner.query(
      `DROP TYPE "public"."contraction_counter_status_enum"`,
    );
  }

  // Helper method to check if a column exists in a table
  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const query = `
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = '${table}' AND column_name = '${column}'
    `;
    const result = await queryRunner.query(query);
    return result.length > 0;
  }
}
