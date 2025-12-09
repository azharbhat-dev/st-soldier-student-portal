/**
 * Application Configuration
 * Central place for all configuration constants
 */

const CONFIG = {
    // API Configuration
    API: {
        // Replace with your Google Apps Script deployment URL
        // Format: https://script.google.com/macros/d/{SCRIPT_ID}/usercopy
        BASE_URL: 'https://script.google.com/macros/s/AKfycby_3IeMiutos2gZq8IKH0bapOlDcm6mwt0qPg9YaNAuhBzEudKy_xEERR-36gSj-psh/exec',
        TIMEOUT: 30000, // 30 seconds
    },

    // Authentication
    AUTH: {
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'admin123',
        SESSION_KEY: 'ss_user',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    },

    // Cache Configuration
    CACHE: {
        ENABLED: true,
        DURATION: {
            STUDENTS: 5 * 60 * 1000, // 5 minutes
            USER: 24 * 60 * 60 * 1000, // 24 hours
        },
        STORAGE_KEY: 'ss_cache',
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        MODAL_BACKDROP_BLUR: true,
    },

    // Courses
    COURSES: [
        'B.Tech (Computer Science)',
        'B.Tech (Electronics)',
        'B.Tech (Mechanical)',
        'B.Tech (Civil)',
        'B.Com',
        'B.A',
        'B.Sc',
        'LLB',
    ],

    // Semesters
    SEMESTERS: [
        { value: '1', label: '1st Semester' },
        { value: '2', label: '2nd Semester' },
        { value: '3', label: '3rd Semester' },
        { value: '4', label: '4th Semester' },
        { value: '5', label: '5th Semester' },
        { value: '6', label: '6th Semester' },
        { value: '7', label: '7th Semester' },
        { value: '8', label: '8th Semester' },
    ],

    // ID Card Configuration
    ID_CARD: {
        WIDTH: 380,
        HEIGHT: 220,
        DPI: 300,
        FORMAT: 'PDF',
        LOGO_URL: 'https://stsoldiergroup.com/wp-content/uploads/2025/09/st-soldier-logo.png',
    },

    // Validation Rules
    VALIDATION: {
        NAME_MIN_LENGTH: 3,
        NAME_MAX_LENGTH: 50,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_PATTERN: /^[0-9]{10}$/,
        ROLL_NO_PATTERN: /^[A-Z0-9-]+$/i,
    },

    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        INVALID_CREDENTIALS: 'Invalid username or password.',
        INVALID_EMAIL: 'Please enter a valid email address.',
        INVALID_PHONE: 'Please enter a valid 10-digit phone number.',
        STUDENT_NOT_FOUND: 'Student not found.',
        DUPLICATE_STUDENT: 'Student with this roll number already exists.',
        SESSION_EXPIRED: 'Your session has expired. Please login again.',
        GENERAL_ERROR: 'An error occurred. Please try again.',
    },

    // Success Messages
    SUCCESS: {
        STUDENT_ADDED: 'Student added successfully!',
        STUDENT_UPDATED: 'Student updated successfully!',
        STUDENT_DELETED: 'Student deleted successfully!',
        ID_CARD_DOWNLOADED: 'ID Card downloaded successfully!',
    },

    // Feature Flags
    FEATURES: {
        EDIT_STUDENT: true,
        DELETE_STUDENT: true,
        GENERATE_ID_CARD: true,
        DOWNLOAD_ID_CARD: true,
        BULK_IMPORT: false, // Coming soon
        QR_CODE: false, // Coming soon
    },

    // Logging
    LOG: {
        ENABLED: true,
        LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    },
};

// Environment-specific configuration
if (typeof window !== 'undefined') {
    // Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        CONFIG.LOG.LEVEL = 'debug';
        CONFIG.CACHE.ENABLED = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}