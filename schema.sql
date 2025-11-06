-- Database setup script for task-api
-- Note: Creating the database may require superuser privileges. Run separately if needed.

-- Create database (run as a privileged user if it doesn't exist)
-- CREATE DATABASE task_manager;

-- Connect to the database before running table creation:
-- \c task_manager;

-- Enable UUID extension (choose one available in your Postgres)
-- Preferred in modern Postgres:
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- provides gen_random_uuid()

-- Fallback (older Postgres installations):
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON tasks;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);

