/**
 * Authentication Manager
 * Handles login, logout, and session management
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.sessionKey = CONFIG.AUTH.SESSION_KEY;
        this.loadSession();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        if (!this.user) {
            this.user = this.loadSession();
        }
        return !!this.user && this.isSessionValid();
    }

    /**
     * Check if session is valid
     * @returns {boolean}
     */
    isSessionValid() {
        if (!this.user) return false;

        const now = Date.now();
        const sessionTimeout = CONFIG.AUTH.SESSION_TIMEOUT;

        if (now - this.user.loginTime > sessionTimeout) {
            this.logout();
            return false;
        }

        return true;
    }

    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {object} - User object if successful
     */
    login(username, password) {
        if (
            username === CONFIG.AUTH.ADMIN_USERNAME &&
            password === CONFIG.AUTH.ADMIN_PASSWORD
        ) {
            this.user = {
                id: Utils.generateUniqueId('USR'),
                username: username,
                role: 'admin',
                loginTime: Date.now(),
            };

            this.saveSession();
            Logger.info('User logged in:', username);
            return this.user;
        } else {
            Logger.warn('Login failed for username:', username);
            return null;
        }
    }

    /**
     * Logout user
     */
    logout() {
        Logger.info('User logged out');
        this.user = null;
        localStorage.removeItem(this.sessionKey);
        Cache.clear();
    }

    /**
     * Get current user
     * @returns {object|null}
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        return this.user;
    }

    /**
     * Save session to localStorage
     * @private
     */
    saveSession() {
        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(this.user));
        } catch (error) {
            Logger.error('Failed to save session:', error);
        }
    }

    /**
     * Load session from localStorage
     * @private
     */
    loadSession() {
        try {
            const stored = localStorage.getItem(this.sessionKey);
            if (stored) {
                const user = JSON.parse(stored);
                // Validate session
                const now = Date.now();
                if (now - user.loginTime > CONFIG.AUTH.SESSION_TIMEOUT) {
                    localStorage.removeItem(this.sessionKey);
                    return null;
                }
                return user;
            }
        } catch (error) {
            Logger.error('Failed to load session:', error);
        }
        return null;
    }

    /**
     * Update session timestamp
     */
    updateSessionActivity() {
        if (this.user) {
            this.user.lastActivity = Date.now();
            this.saveSession();
        }
    }

    /**
     * Get session info
     * @returns {object}
     */
    getSessionInfo() {
        if (!this.user) {
            return { authenticated: false };
        }

        const now = Date.now();
        const timeLeft = Math.max(
            0,
            CONFIG.AUTH.SESSION_TIMEOUT - (now - this.user.loginTime)
        );

        return {
            authenticated: true,
            user: this.user,
            timeLeftMs: timeLeft,
            timeLeftMinutes: Math.floor(timeLeft / 60000),
        };
    }
}

// Initialize global auth manager
const Auth = new AuthManager();

// Monitor user activity to update session
document.addEventListener('click', () => Auth.updateSessionActivity());
document.addEventListener('keydown', () => Auth.updateSessionActivity());