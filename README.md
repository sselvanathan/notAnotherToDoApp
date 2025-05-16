# Not Another Todo App

A modern Todo application built with React, TypeScript, and Vite.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

### Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### Install dependencies

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

### Building for Production

Build the application for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm preview`: Preview the production build
- `pnpm lint`: Run ESLint to check for code issues
- `pnpm lint:fix`: Run ESLint and automatically fix issues
- `pnpm format`: Format code using Prettier
- `pnpm test`: Run tests
- `pnpm test:watch`: Run tests in watch mode
- `pnpm test:coverage`: Run tests with coverage report

## Using pnpm

### Adding dependencies

```bash
# Add a dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name
```

### Updating dependencies

```bash
# Update all dependencies
pnpm update

# Update a specific dependency
pnpm update package-name
```

### Removing dependencies

```bash
pnpm remove package-name
```

## Project Structure

- `src/`: Source code
  - `components/`: React components
  - `store/`: State management (using Zustand)
  - `test/`: Test files and setup
- `public/`: Static assets