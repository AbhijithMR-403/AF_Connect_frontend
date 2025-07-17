# AF Connect Frontend

A React-based dashboard application for AF Connect.

## Environment Setup

### 1. Create Environment File

Copy the example environment file and create your own `.env` file:

```bash
cp env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file and set your API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the frontend application.

### 3. Available Environment Variables

- `VITE_API_BASE_URL`: The base URL for your API server (default: http://localhost:3000)

## Development

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
```

## Environment Variables in Vite

This project uses Vite, which requires environment variables to be prefixed with `VITE_` to be accessible in the frontend code. The environment variables are accessed using `import.meta.env.VITE_VARIABLE_NAME`. 