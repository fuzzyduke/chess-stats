
import os
import sys
import chess
import chess.engine
import chess.pgn
import requests
import io
from datetime import datetime
import json

# --- Configuration ---
SUPABASE_URL = "https://usybnhokbkycfxuabusm.supabase.co"
SUPABASE_KEY = "sb_publishable_rJ_RF0Eyoqzqz5NazNFNfw_WIaWV8f9"

# Stockfish Configuration
STOCKFISH_PATH = "./stockfish.exe" 
if not os.path.exists(STOCKFISH_PATH):
    STOCKFISH_PATH = "stockfish"

# --- Simple Supabase Client via Requests ---
class SimpleSupabase:
    def __init__(self, url, key):
        self.base_url = url
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal" # Don't need response body for inserts usually
        }

    def upsert(self, table, data, on_conflict="id"):
        # For upsert, we use POST with Prefer: resolution=merge-duplicates provided we know the PK?
        # Actually PostgREST syntax for upsert is POST with ON CONFLICT header.
        headers = self.headers.copy()
        headers["Prefer"] = f"resolution=merge-duplicates"
        # upsert in postgrest needs specific handling, for simplicity let's do INSERT which fails or works, 
        # or separate Check then Insert.
        # But for 'analysis_jobs' we need upsert on username.
        
        # PostgREST Upsert: POST /table?on_conflict=username
        url = f"{self.base_url}/rest/v1/{table}?on_conflict={on_conflict}"
        resp = requests.post(url, headers=headers, json=data)
        if resp.status_code >= 400:
             print(f"Supabase Error {resp.status_code}: {resp.text}")

    def update(self, table, data, match_col, match_val):
        url = f"{self.base_url}/rest/v1/{table}?{match_col}=eq.{match_val}"
        resp = requests.patch(url, headers=self.headers, json=data)
        if resp.status_code >= 400:
             print(f"Supabase Error {resp.status_code}: {resp.text}")

    def insert(self, table, data):
        url = f"{self.base_url}/rest/v1/{table}"
        resp = requests.post(url, headers=self.headers, json=data)
        if resp.status_code >= 400:
             print(f"Supabase Error {resp.status_code}: {resp.text}")
        else:
             print(f"Saved to DB: {resp.status_code}")

# --- Main Worker Class ---

class AnalysisWorker:
    def __init__(self, username):
        self.username = username
        self.supabase = SimpleSupabase(SUPABASE_URL, SUPABASE_KEY)
        self.engine = None

    def init_engine(self):
        try:
            self.engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
            print(f"✅ Stockfish initialized: {STOCKFISH_PATH}")
        except FileNotFoundError:
            print(f"❌ Stockfish not found at {STOCKFISH_PATH}. Please ensure Stockfish is in your path or ./stockfish/")
            sys.exit(1)

    def fetch_games_archive(self):
        url = f"https://api.chess.com/pub/player/{self.username}/games/archives"
        try:
            resp = requests.get(url, headers={'User-Agent': 'ChessStats/1.0'})
            if resp.status_code == 200:
                return resp.json()['archives']
            return []
        except Exception as e:
            print(f"Error fetching archives: {e}")
            return []

    def fetch_games_from_url(self, url):
        try:
            resp = requests.get(url, headers={'User-Agent': 'ChessStats/1.0'})
            if resp.status_code == 200:
                data = resp.json()
                return data.get('games', [])
            return []
        except Exception as e:
            print(f"Error fetching games from {url}: {e}")
            return []

    def run(self):
        print(f"🚀 Starting Worker for {self.username}")
        self.init_engine()
        
        # Create Job
        job_data = {
            "username": self.username,
            "status": "processing", 
            "games_total": 0,
            "games_processed": 0
        }
        self.supabase.upsert("analysis_jobs", job_data, on_conflict="username")

        archives = self.fetch_games_archive()
        all_games = []
        
        # Fetch ALL archives (not just the last one)
        if archives:
            print(f"Found {len(archives)} monthly archives. Fetching all games...")
            for i, archive_url in enumerate(archives, 1):
                print(f"  Fetching archive {i}/{len(archives)}: {archive_url}")
                games = self.fetch_games_from_url(archive_url)
                all_games.extend(games)
                print(f"    → {len(games)} games in this archive (total: {len(all_games)})")
        
        total = len(all_games)
        print(f"\nFound {total} total games to analyze.")
        
        self.supabase.update("analysis_jobs", {"games_total": total}, "username", self.username)

        # Clear existing blunders for this user to avoid duplicates/stale data
        try:
             # This is a bit hacky with the simple client but let's try to delete
             # DELETE /blunder_positions?username=eq.{self.username}
             url = f"{self.supabase.base_url}/rest/v1/blunder_positions?username=eq.{self.username}"
             requests.delete(url, headers=self.supabase.headers)
             print("Cleared previous analysis data.")
        except:
             pass

        processed = 0
        for g_data in all_games:
            pgn = g_data.get('pgn')
            url = g_data.get('url')
            if pgn:
                self.process_single_game(pgn, url)
                processed += 1
                
                if processed % 10 == 0:
                     self.supabase.update("analysis_jobs", {"games_processed": processed}, "username", self.username)
                     print(f"Processed {processed}/{total}")

        self.supabase.update("analysis_jobs", {"status": "completed", "games_processed": total}, "username", self.username)
        print(f"\n✅ Analysis complete! Processed {total} games.")
        self.engine.quit()

    def process_single_game(self, pgn_text, url):
        try:
            game = chess.pgn.read_game(io.StringIO(pgn_text))
            board = game.board()
            
            is_white = game.headers.get("White", "").lower() == self.username.lower()
            
            node = game
            prev_eval = None
            last_move_uci = None
            last_best_move_uci = None
            
            while not node.is_end():
                next_node = node.variation(0)
                move = next_node.move
                
                # We are analyzing the transition from 'board' (before move) to state after move.
                # After 'board.push(move)', the turn changes.
                # We want to check if the move we are ABOUT to push (which is by board.turn) 
                # was made by the user.
                
                who_is_moving = board.turn
                is_user_move = (who_is_moving == chess.WHITE and is_white) or (who_is_moving == chess.BLACK and not is_white)
                
                # Analyze BEFORE the move (Position A)
                # Note: We already analyzed Position A in the previous iteration as 'current_eval' of that iteration.
                # But to keep it simple and stateless within the loop, we analyze again or use cache?
                # Actually, 'prev_eval' stores the eval of the board BEFORE the move.
                
                # Correction: The existing logic calculated 'current_eval' for the 'board' state.
                # Then compared it to 'prev_eval'. 
                # In Iteration 1: Board=Start. Eval=0.2. Prev=None.
                # If we just calculate Eval here, we have Eval(Start).
                # Move 1.e4 happens.
                # Iteration 2: Board=After 1.e4. Eval=0.2. Prev=0.2.
                # Diff = 0.
                
                # If 1.e4 was a blunder, Eval(Start)=0.2. Eval(After 1.e4) = -200.
                # Iteration 2: current=-200. prev=0.2.
                # diff = 0.2 - (-200) = 200.2. BLUNDER detected.
                
                # So we need to check if the *Move that caused the transition to Current Board* was by the user.
                # In Iteration 2 (Turn=Black), the board state is result of White moving.
                # So if I am White, I should check in Iteration 2.
                # In Iteration 2, board.turn is BLACK.
                # So "was_user_move" should be true if (board.turn == BLACK && is_white).
                
                # Calculate Eval for CURRENT position
                info = self.engine.analyse(board, chess.engine.Limit(depth=10))
                score_obj = info["score"].white()
                score_val = score_obj.score(mate_score=2000)
                best_move = info.get("pv")[0] if info.get("pv") else None

                current_eval = score_val
                
                # Check for blunder based on previous eval
                if prev_eval is not None:
                     # Check who made the move that got us here?
                     # The move was made by the side OPPOSITE to board.turn
                     just_moved_side = not board.turn 
                     # (White=True, Black=False in chess lib usually? No, check.turn is Boolean True for White)
                     
                     was_user_move = (just_moved_side == chess.WHITE and is_white) or (just_moved_side == chess.BLACK and not is_white)
                
                     if was_user_move:
                         diff = 0
                         if is_white:
                             # White moved. Prev (White) - Current (White).
                             # If Prev=0.5, Curr=-2.0. Diff = 2.5.
                             diff = prev_eval - current_eval
                         else:
                             # Black moved. 
                             # Prev (White) = 0.5. Curr (White) = 2.0.
                             # Black's perspective: -0.5 -> -2.0. Drop of 1.5.
                             # Formula: Current - Prev.
                             # 2.0 - 0.5 = 1.5. Correct.
                             diff = current_eval - prev_eval
                             
                         if diff > 200:
                             print(f"  Blunder found! Drop: {diff}")
                             
                             # We want to save the position BEFORE the blunder.
                             # Currently 'board' is the position AFTER the blunder (result of last_move_uci).
                             # So we pop() to get the position before the user moved.
                             board.pop() 
                             fen_before = board.fen()
                             # Restore board state
                             board.push(chess.Move.from_uci(last_move_uci))
                             
                             self.save_blunder(url, fen_before, diff, last_best_move_uci, last_move_uci)

                prev_eval = current_eval
                
                # Track the move for next iteration's blunder saving
                last_move_uci = move.uci()
                last_best_move_uci = best_move.uci() if best_move else ""
                
                board.push(move)
                node = next_node
                
        except Exception as e:
            print(f"Error processing game {url}: {e}") 
            # pass

    def save_blunder(self, url, fen, drop, best, played):
        data = {
            "username": self.username,
            "game_url": url,
            "pfenc": fen,
            "eval_before": 0,
            "eval_after": -drop,
            "best_move": best,
            "player_move": played,
            "position_type": "blunder"
        }
        self.supabase.insert("blunder_positions", data)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_worker.py <username>")
        # Default for testing if arg missing
        # sys.exit(1)
        worker = AnalysisWorker("eg0maniac") 
        worker.run()
    else:
        worker = AnalysisWorker(sys.argv[1])
        worker.run()
