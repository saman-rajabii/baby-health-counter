import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateContractionLogEntity1712989002000
  implements MigrationInterface
{
  name = 'CreateContractionLogEntity1712989002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'endedAt',
            type: 'timestamp',
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
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'contractionLogs',
      new TableForeignKey({
        columnNames: ['counterId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contractionCounters',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint first
    const table = await queryRunner.getTable('contractionLogs');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('counterId') !== -1,
    );
    await queryRunner.dropForeignKey('contractionLogs', foreignKey);

    // Drop the table
    await queryRunner.dropTable('contractionLogs');
  }
}
