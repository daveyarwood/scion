# 🌱 Scion

A personal creative sketchbook for musical fragments. Song ideas are represented as "plants" — living things you can tend and develop over time. Each idea starts as a seed and grows as you flesh it out.

Scion is a local full-stack web application, intended initially for personal use with social/collaborative features as a future possibility.

## The Plant Metaphor

The soul of Scion is treating your musical ideas like living things. Just as you might tend a garden, you cultivate your songs:

- **Seeds** are brand new ideas — raw, untested, full of potential
- **Seedlings** are ideas you've started developing — you've added some structure or notes
- As ideas grow, they develop more completely, with richer arrangement, more complete lyrics, etc.
- Plants are visual representations, algorithmically generated and seeded by the song's ID, so each song has a unique visual identity that evolves as it grows

This metaphor informs everything from the UI to the data model.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + tRPC
- **Validation**: Zod (shared between client and server)
- **Database**: SQLite via better-sqlite3 (raw SQL, no ORM)
- **Migrations**: Plain numbered `.sql` files with a custom migration runner
- **Package manager**: Yarn
- **Test runner**: Vitest

## Project Structure

```
scion/
  src/
    client/    # React + TypeScript + Vite frontend
    server/    # Express + tRPC backend
    shared/    # Zod schemas and shared types (importable by both client and server)
  data/        # gitignored — SQLite database and uploaded audio files live here
  migrations/  # Numbered .sql migration files (e.g. 001_initial_schema.sql)
  scripts/     # Development utilities (migrate.ts, etc.)
  cycles/      # Cycle planning documents
```

## Getting Started

### Prerequisites

- Node.js 18+ (or whatever version your system has)
- Yarn (v1.22+)

### Installation

```bash
# Install dependencies
yarn install
```

### Running the Development Server

```bash
# Set up the database (runs migrations)
yarn migrate

# Start the dev server
yarn dev
```

The app will be available at `http://localhost:5173` (Vite default) and the tRPC server at `http://localhost:3000`.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in UI mode
yarn test:ui

# Run a specific test file
yarn test scripts/migrate.test.ts
```

### Database Migrations

The database schema is managed via SQL migrations in the `migrations/` directory.

To create a new migration:

1. Create a new file in `migrations/` with the naming convention `NNN_description.sql` (e.g., `002_add_user_table.sql`)
2. Write your SQL schema changes
3. Run `yarn migrate` to apply pending migrations

Migrations are applied in order and tracked in the `schema_migrations` table. Each migration is idempotent and only applied once.

### Code Quality

```bash
# Type check without emitting
yarn type-check

# Lint the codebase
yarn lint

# Format code
yarn format

# Build for production
yarn build
```

## Design Decisions

Some features are intentionally deferred and documented in [AGENTS.md](./AGENTS.md) for future cycles:

- **Plots**: Grouping mechanism for song ideas (by project, genre, etc.). The data model includes `plot_id` from day one, but the UI is deferred.
- **Audio file uploads**: Local file uploads to the server. The backend architecture already accommodates this.
- **Plant decay/withering**: Song plants could wither if not developed for a while. Documented as a future idea.
- **Alda integration**: Input Alda notation text for playback via the Alda engine. Deferred feature.
- **Collaboration**: Social/collaborative features. Not in scope for the local-first phase.

## License

MIT — see [LICENSE](LICENSE).

## Contributing

This is a personal project. For now, it's not open to external contributions. Future directions may change this.
