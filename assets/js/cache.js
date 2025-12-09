/**
 * Cache Management System
 * Implements local caching with automatic expiration
 */

class CacheManager {
    constructor() {
        this.storageKey = CONFIG.CACHE.STORAGE_KEY;
        this.enabled = CONFIG.CACHE.ENABLED;
        this.cache = this.loadFromStorage();
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {*} - Cached value or null if expired/not found
     */
    get(key) {
        if (!this.enabled) return null;

        const item = this.cache[key];
        if (!item) return null;

        // Check if expired
        if (item.expiresAt && item.expiresAt < Date.now()) {
            delete this.cache[key];
            this.saveToStorage();
            Logger.debug(`Cache expired for key: ${key}`);
            return null;
        }

        Logger.debug(`Cache hit for key: ${key}`);
        return item.value;
    }

    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} duration - Cache duration in milliseconds
     */
    set(key, value, duration = CONFIG.CACHE.DURATION.STUDENTS) {
        if (!this.enabled) return;

        this.cache[key] = {
            value: value,
            expiresAt: Date.now() + duration,
            createdAt: Date.now(),
        };

        this.saveToStorage();
        Logger.debug(`Cache set for key: ${key}, duration: ${duration}ms`);
    }

    /**
     * Remove specific cache entry
     * @param {string} key - Cache key
     */
    remove(key) {
        delete this.cache[key];
        this.saveToStorage();
        Logger.debug(`Cache removed for key: ${key}`);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache = {};
        this.saveToStorage();
        Logger.debug('Cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache stats
     */
    getStats() {
        const stats = {
            total: Object.keys(this.cache).length,
            size: JSON.stringify(this.cache).length,
            entries: {},
        };

        Object.entries(this.cache).forEach(([key, item]) => {
            const timeLeft = item.expiresAt - Date.now();
            stats.entries[key] = {
                createdAt: new Date(item.createdAt).toISOString(),
                expiresAt: new Date(item.expiresAt).toISOString(),
                ttl: Math.max(0, Math.floor(timeLeft / 1000)) + 's',
            };
        });

        return stats;
    }

    /**
     * Load cache from localStorage
     * @private
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            Logger.warn('Failed to load cache from storage:', error);
            return {};
        }
    }

    /**
     * Save cache to localStorage
     * @private
     */
    saveToStorage() {
        try {
            const size = JSON.stringify(this.cache).length;
            const maxSize = 5 * 1024 * 1024; // 5MB limit

            if (size > maxSize) {
                Logger.warn('Cache size exceeds limit, clearing old entries');
                this.clearOldEntries();
            }

            localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
        } catch (error) {
            Logger.error('Failed to save cache to storage:', error);
            if (error.name === 'QuotaExceededError') {
                this.clear();
            }
        }
    }

    /**
     * Clear old cache entries
     * @private
     */
    clearOldEntries() {
        const entries = Object.entries(this.cache)
            .sort((a, b) => a[1].createdAt - b[1].createdAt);

        const toDelete = Math.ceil(entries.length / 2);
        for (let i = 0; i < toDelete; i++) {
            delete this.cache[entries[i][0]];
        }

        this.saveToStorage();
    }

    /**
     * Invalidate cache by pattern
     * @param {string|RegExp} pattern - Pattern to match keys
     */
    invalidatePattern(pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        const keys = Object.keys(this.cache).filter(key => regex.test(key));

        keys.forEach(key => this.remove(key));
        Logger.debug(`Invalidated ${keys.length} cache entries matching pattern`);
    }
}

// Initialize global cache manager
const Cache = new CacheManager();

/**
 * Logger Utility
 * Simple logging system with levels
 */
class Logger {
    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logLevel = CONFIG.LOG.LEVEL;
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };

        if (levels[level] >= levels[logLevel]) {
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

            if (data) {
                console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'](
                    logMessage,
                    data
                );
            } else {
                console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'](
                    logMessage
                );
            }
        }
    }

    static debug(message, data = null) {
        this.log('debug', message, data);
    }

    static info(message, data = null) {
        this.log('info', message, data);
    }

    static warn(message, data = null) {
        this.log('warn', message, data);
    }

    static error(message, data = null) {
        this.log('error', message, data);
    }
}

// Make Logger globally available
window.Logger = Logger;