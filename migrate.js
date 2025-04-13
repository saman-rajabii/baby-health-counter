/**
 * Database migration helper script
 * Usage:
 *   node migrate.js run - Run all pending migrations
 *   node migrate.js revert - Revert the most recent migration
 *   node migrate.js generate <name> - Generate a new migration with the specified name
 */

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const command = process.argv[2];
const migrationName = process.argv[3];

// Configure TypeORM CLI options
const typeormConfig = path.join(__dirname, 'dist/config/typeorm.config.js');

// Execute migration commands
switch (command) {
  case 'run':
    console.log('Running migrations...');
    execSync(`npm run build && npx typeorm migration:run -d ${typeormConfig}`, {
      stdio: 'inherit',
    });
    break;

  case 'revert':
    console.log('Reverting last migration...');
    execSync(
      `npm run build && npx typeorm migration:revert -d ${typeormConfig}`,
      { stdio: 'inherit' },
    );
    break;

  case 'generate':
    if (!migrationName) {
      console.error('Migration name is required for generate command');
      process.exit(1);
    }
    console.log(`Generating migration: ${migrationName}...`);
    execSync(
      `npm run build && npx typeorm migration:generate -d ${typeormConfig} -n ${migrationName}`,
      { stdio: 'inherit' },
    );
    break;

  default:
    console.log(`
Migration Helper Script
======================

Commands:
  node migrate.js run            - Run all pending migrations
  node migrate.js revert         - Revert the most recent migration
  node migrate.js generate NAME  - Generate a new migration with the given name
`);
    break;
}
