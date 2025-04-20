import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class InitialMigration1713000000000 implements MigrationInterface {
  name = 'InitialMigration1713000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create uuid-ossp extension for UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create counterSettings table
    await queryRunner.createTable(
      new Table({
        name: 'counterSettings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'counterType',
            type: 'enum',
            enum: ['KICK', 'CONTRACTION'],
            default: `'KICK'`,
          },
          {
            name: 'minCount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'minPeriod',
            type: 'int',
            isNullable: false,
            comment: 'Period in minutes',
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create pregnancyStatuses table
    await queryRunner.createTable(
      new Table({
        name: 'pregnancyStatuses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'week',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create kickCounters table
    await queryRunner.createTable(
      new Table({
        name: 'kickCounters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'startedAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'finishedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'period',
            type: 'int',
            default: 2,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create contractionCounters table with enum type
    await queryRunner.query(
      `CREATE TYPE "public"."contraction_counter_status_enum" AS ENUM('active', 'closed')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'contractionCounters',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'closed'],
            enumName: 'contraction_counter_status_enum',
            default: `'active'`,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create kickLogs table
    await queryRunner.createTable(
      new Table({
        name: 'kickLogs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'happenedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'counterId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create contractionLogs table
    await queryRunner.createTable(
      new Table({
        name: 'contractionLogs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'startedAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'endedAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: false,
            comment: 'Duration in seconds',
          },
          {
            name: 'counterId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key: pregnancyStatuses.userId -> users.id
    await queryRunner.createForeignKey(
      'pregnancyStatuses',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key: kickCounters.userId -> users.id
    await queryRunner.createForeignKey(
      'kickCounters',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key: contractionCounters.userId -> users.id
    await queryRunner.createForeignKey(
      'contractionCounters',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key: kickLogs.counterId -> kickCounters.id
    await queryRunner.createForeignKey(
      'kickLogs',
      new TableForeignKey({
        columnNames: ['counterId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'kickCounters',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key: contractionLogs.counterId -> contractionCounters.id
    await queryRunner.createForeignKey(
      'contractionLogs',
      new TableForeignKey({
        columnNames: ['counterId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contractionCounters',
        onDelete: 'CASCADE',
      }),
    );

    // Insert default counter settings
    await queryRunner.query(`
      INSERT INTO "counterSettings" ("counterType", "minCount", "minPeriod")
      VALUES 
        ('KICK', 10, 120),
        ('CONTRACTION', 3, 60)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const pregnancyStatusesTable =
      await queryRunner.getTable('pregnancyStatuses');
    const pregnancyStatusesFK = pregnancyStatusesTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    await queryRunner.dropForeignKey('pregnancyStatuses', pregnancyStatusesFK);

    const kickCountersTable = await queryRunner.getTable('kickCounters');
    const kickCountersFK = kickCountersTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    await queryRunner.dropForeignKey('kickCounters', kickCountersFK);

    const contractionCountersTable = await queryRunner.getTable(
      'contractionCounters',
    );
    const contractionCountersFK = contractionCountersTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    await queryRunner.dropForeignKey(
      'contractionCounters',
      contractionCountersFK,
    );

    const kickLogsTable = await queryRunner.getTable('kickLogs');
    const kickLogsFK = kickLogsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('counterId') !== -1,
    );
    await queryRunner.dropForeignKey('kickLogs', kickLogsFK);

    const contractionLogsTable = await queryRunner.getTable('contractionLogs');
    const contractionLogsFK = contractionLogsTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('counterId') !== -1,
    );
    await queryRunner.dropForeignKey('contractionLogs', contractionLogsFK);

    // Drop tables
    await queryRunner.dropTable('contractionLogs');
    await queryRunner.dropTable('kickLogs');
    await queryRunner.dropTable('contractionCounters');
    await queryRunner.dropTable('kickCounters');
    await queryRunner.dropTable('pregnancyStatuses');
    await queryRunner.dropTable('counterSettings');
    await queryRunner.dropTable('users');

    // Drop enum type
    await queryRunner.query(
      `DROP TYPE "public"."contraction_counter_status_enum"`,
    );
  }
}
