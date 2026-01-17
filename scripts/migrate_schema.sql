-- Migration: Training Mode Schema
-- Author: Gemini
-- Date: 2026-01-11

-- Table: analysis_jobs
-- Tracks the progress of bulk analysis for a user.
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    username TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    games_total INT DEFAULT 0,
    games_processed INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: blunder_positions
-- Stores specific positions where a user made a significant mistake (or brilliancy).
CREATE TABLE IF NOT EXISTS public.blunder_positions (
    id SERIAL PRIMARY KEY,
    game_url TEXT NOT NULL,
    username TEXT NOT NULL,
    pfenc TEXT NOT NULL, -- "Processed FEN" (using 'pfenc' to avoid reserved word conflicts if any, effectively just the FEN string)
    move_number INT,
    eval_before INT, -- centipawns
    eval_after INT,  -- centipawns
    best_move TEXT,  -- UCI format (e.g., "e2e4")
    player_move TEXT, -- UCI format
    position_type TEXT CHECK (position_type IN ('blunder', 'brilliancy', 'missed_win')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_blunders_username ON public.blunder_positions(username);
CREATE INDEX IF NOT EXISTS idx_blunders_type ON public.blunder_positions(position_type);
CREATE INDEX IF NOT EXISTS idx_blunders_user_type ON public.blunder_positions(username, position_type);

-- RLS Policies (Open for Demo, restrict in Prod)
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blunder_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Jobs Access" ON public.analysis_jobs;
CREATE POLICY "Public Jobs Access" ON public.analysis_jobs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Blunders Access" ON public.blunder_positions;
CREATE POLICY "Public Blunders Access" ON public.blunder_positions FOR ALL USING (true);
