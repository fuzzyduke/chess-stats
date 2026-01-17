

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// --- Configuration ---
// These should ideally be environment variables, but for this client-side demo we hardcode the publishable key.
const SUPABASE_URL = 'https://usybnhokbkycfxuabusm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rJ_RF0Eyoqzqz5NazNFNfw_WIaWV8f9'; // Publishable Key (Safe for browser)

// --- Adapters ---

/**
 * Adapter for IndexedDB (The original local storage logic)
 */
class IndexedDBAdapter {
    constructor() {
        this.dbName = 'ChessStatsDB';
        this.storeName = 'analysis_results';
        this.version = 1;
        this.db = null;
        this.ready = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onerror = (e) => reject(e.target.error);
            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.log("Storage: IndexedDB Ready");
                resolve(this.db);
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'gameId' });
                }
            };
        });
    }

    async save(gameId, data) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readwrite');
            const store = tx.objectStore(this.storeName);
            const entry = { gameId, data, timestamp: Date.now(), version: 1 };
            const req = store.put(entry);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }

    async get(gameId) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([this.storeName], 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get(gameId);
            req.onsuccess = () => resolve(req.result ? req.result.data : null);
            req.onerror = () => reject(req.error);
        });
    }
}

/**
 * Adapter for Supabase (Cloud storage for premium users)
 */
class SupabaseAdapter {
    constructor() {
        this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
        this.tableName = 'analysis_results';
        console.log("Storage: Supabase Adapter Initialized");
    }

    async save(gameId, data) {
        // Upsert: Insert or Update based on Primary Key (game_id)
        // Note: The table 'analysis_results' must exist in Supabase with 'game_id' as PK.
        const { error } = await this.client
            .from(this.tableName)
            .upsert({
                game_id: gameId,
                data: data,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error("Supabase Save Error:", error);
            throw error;
        }
        return true;
    }

    async get(gameId) {
        const { data, error } = await this.client
            .from(this.tableName)
            .select('data')
            .eq('game_id', gameId)
            .maybeSingle();

        if (error) {
            console.error("Supabase Get Error:", error);
            throw error;
        }
        return data ? data.data : null;
    }

    getClient() {
        return this.client;
    }
}

// --- Storage Manager (Facade) ---

class StorageManager {
    constructor() {
        this.adapter = null;
        this.premiumUsers = ['eg0maniac']; // Hardcoded list as requested
    }

    /**
     * Initialize the storage system based on the active user.
     * @param {string} username - The Chess.com username being analyzed.
     */
    initForUser(username) {
        const user = username.toLowerCase();
        if (this.premiumUsers.includes(user)) {
            console.log(`User ${user} is PREMIUM. Using Supabase.`);
            this.adapter = new SupabaseAdapter();
            return "Supabase (Premium 💎)";
        } else {
            console.log(`User ${user} is FREE. Using IndexedDB.`);
            this.adapter = new IndexedDBAdapter();
            return "IndexedDB (Free 📦)";
        }
    }

    /**
     * Helper to ensure initialization happened.
     * Defaults to IndexedDB if no user context is set (e.g., initially).
     */
    _ensureAdapter() {
        if (!this.adapter) {
            console.warn("Storage accessed before user context set. Defaulting to IndexedDB.");
            this.adapter = new IndexedDBAdapter();
        }
        return this.adapter;
    }

    async save(gameId, data) {
        return this._ensureAdapter().save(gameId, data);
    }

    async get(gameId) {
        return this._ensureAdapter().get(gameId);
    }

    getSupabaseClient() {
        if (this.adapter && typeof this.adapter.getClient === 'function') {
            return this.adapter.getClient();
        }
        return null;
    }
}

// Export a singleton instance
export const storage = new StorageManager();
