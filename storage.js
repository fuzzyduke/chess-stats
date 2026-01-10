/**
 * ARCH-002: Universal Storage Adapter (IndexedDB Implementation)
 * 
 * Why IndexedDB?
 * 1. Capacity: Stores 100s of MBs (vs LocalStorage 5MB, Cookies 4KB)
 * 2. Async: Doesn't block UI when saving massive analysis files
 * 3. Structure: Perfect for key-value storage of GameID -> AnalysisData
 */

const DB_NAME = 'ChessStatsDB';
const DB_VERSION = 1;
const STORE_NAME = 'analysis_results';

class ChessStorage {
    constructor() {
        this.db = null;
        this.ready = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Storage System: Online (IndexedDB)");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create an objectStore for analysis results
                // KeyPath is 'gameId' (e.g., 'https://www.chess.com/game/live/123456')
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'gameId' });
                }
            };
        });
    }

    async save(gameId, data) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Add timestamp for potential sync conflict resolution (ARCH-002)
            const entry = {
                gameId: gameId,
                data: data,
                timestamp: Date.now(),
                version: 1
            };

            const request = store.put(entry);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async get(gameId) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(gameId);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data); // Return just the payload
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllKeys() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global instance
const storage = new ChessStorage();
