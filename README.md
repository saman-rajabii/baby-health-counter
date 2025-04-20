# Baby Health Counter App

This application helps pregnant women track fetal movements ("kick counting") and contractions.

## Features

- Track baby kicks with time-based counters
- Record and monitor contractions
- User authentication and profile management
- Statistics for kick counts and contractions

## Database Structure

The application uses the following database structure:

```
┌─────────────────────┐      ┌──────────────────────┐      ┌───────────────────┐
│      users          │      │    kickCounters      │      │     kickLogs      │
├─────────────────────┤      ├──────────────────────┤      ├───────────────────┤
│ id (PK)             │      │ id (PK)              │      │ id (PK)           │
│ name                │      │ startedAt            │      │ happenedAt        │
│ email               │◄─────┤ finishedAt           │◄─────┤ counterId (FK)    │
│ password            │      │ period               │      │ createdAt         │
│ isActive            │      │ userId (FK)          │      │ updatedAt         │
│ createdAt           │      │ createdAt            │      └───────────────────┘
│ updatedAt           │      │ updatedAt            │
└─────────────────────┘      └──────────────────────┘
          ▲
          │
          │                   ┌──────────────────────┐      ┌───────────────────┐
          │                   │ contractionCounters  │      │  contractionLogs  │
          │                   ├──────────────────────┤      ├───────────────────┤
          └───────────────────┤ id (PK)              │      │ id (PK)           │
          │                   │ status               │◄─────┤ startedAt         │
          │                   │ userId (FK)          │      │ endedAt           │
          │                   │ createdAt            │      │ duration          │
          │                   │ updatedAt            │      │ counterId (FK)    │
          │                   └──────────────────────┘      │ createdAt         │
          │                                                 │ updatedAt         │
          │                                                 └───────────────────┘
          │
          │                   ┌──────────────────────┐
          │                   │  pregnancyStatuses   │
          │                   ├──────────────────────┤
          └───────────────────┤ id (PK)              │
                              │ week                 │
                              │ userId (FK)          │
                              │ createdAt            │
                              │ updatedAt            │
                              └──────────────────────┘

┌───────────────────┐
│  counterSettings  │
├───────────────────┤
│ id (PK)           │
│ counterType       │
│ minCount          │
│ minPeriod         │
│ createdAt         │
│ updatedAt         │
└───────────────────┘
```

### Entity Relationships

1. **User**

   - Has many KickCounters
   - Has many ContractionCounters
   - Has many PregnancyStatuses

2. **KickCounter**

   - Belongs to one User
   - Has many KickLogs

3. **ContractionCounter**

   - Belongs to one User
   - Has many ContractionLogs

4. **KickLog**

   - Belongs to one KickCounter

5. **ContractionLog**

   - Belongs to one ContractionCounter

6. **PregnancyStatus**

   - Belongs to one User

7. **CounterSetting**
   - Standalone configuration entity for counter thresholds

---

## How To Run

## Docker Setup

This project is containerized using Docker and Docker Compose for easy deployment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)

### Environment Configuration

1. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=baby_health

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="Baby Health App <your_gmail_address@gmail.com>"
```

> Note: The Docker Compose setup will override some of these values (DB_HOST will be set to 'postgres').

### Building and Starting the Application

1. **Build and start the containers**:

```bash
docker-compose up -d
```

This command will:

- Build the NestJS application image
- Start a PostgreSQL database container
- Run database migrations automatically
- Start the application on port 7000

2. **View logs**:

```bash
docker-compose logs -f
```

3. **Stop the application**:

```bash
docker-compose down
```

4. **Stop and remove volumes** (This will delete all data!):

```bash
docker-compose down -v
```

### Accessing the Application

- API: http://localhost:7000
- API Documentation: http://localhost:7000/doc (Swagger UI)
- Database: PostgreSQL on localhost:5432 (for external tools)

## Development Without Docker

If you prefer to develop without Docker:

```bash
# Installation
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Database Migrations

To manage database migrations manually:

```bash
# Run migrations
npm run migration:run

# Generate a new migration
npm run migration:generate MyMigrationName

# Revert the most recent migration
npm run migration:revert
```

## License

This project is [MIT licensed](LICENSE).
