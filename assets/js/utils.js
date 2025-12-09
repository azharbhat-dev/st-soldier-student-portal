/**
 * Utility Functions
 * Helper functions for validation, formatting, and DOM operations
 */

class Utils {
    /**
     * Validate email
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    static validateEmail(email) {
        return CONFIG.VALIDATION.EMAIL_PATTERN.test(email);
    }

    /**
     * Validate phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean}
     */
    static validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return CONFIG.VALIDATION.PHONE_PATTERN.test(cleaned);
    }

    /**
     * Validate name
     * @param {string} name - Name to validate
     * @returns {boolean}
     */
    static validateName(name) {
        const trimmed = name.trim();
        return (
            trimmed.length >= CONFIG.VALIDATION.NAME_MIN_LENGTH &&
            trimmed.length <= CONFIG.VALIDATION.NAME_MAX_LENGTH
        );
    }

    /**
     * Validate roll number
     * @param {string} rollNo - Roll number to validate
     * @returns {boolean}
     */
    static validateRollNo(rollNo) {
        return CONFIG.VALIDATION.ROLL_NO_PATTERN.test(rollNo.trim());
    }

    /**
     * Validate student form data
     * @param {object} data - Student data
     * @returns {object} - Validation result
     */
    static validateStudentForm(data) {
        const errors = {};

        if (!this.validateName(data.name)) {
            errors.name = `Name must be between ${CONFIG.VALIDATION.NAME_MIN_LENGTH} and ${CONFIG.VALIDATION.NAME_MAX_LENGTH} characters`;
        }

        if (!this.validateName(data.fatherName)) {
            errors.fatherName = 'Invalid father name';
        }

        if (!this.validateEmail(data.email)) {
            errors.email = 'Invalid email address';
        }

        if (!this.validatePhone(data.phone)) {
            errors.phone = 'Phone number must be 10 digits';
        }

        if (!data.course || data.course.trim() === '') {
            errors.course = 'Please select a course';
        }

        if (!data.semester || data.semester.trim() === '') {
            errors.semester = 'Please select a semester';
        }

        if (!this.validateRollNo(data.rollNo)) {
            errors.rollNo = 'Invalid roll number format';
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors: errors,
        };
    }

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string}
     */
    static generateUniqueId(prefix = 'STU') {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    /**
     * Generate random string
     * @param {number} length - Length of string
     * @returns {string}
     */
    static generateRandomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Format phone number
     * @param {string} phone - Phone number
     * @returns {string} - Formatted phone
     */
    static formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== 10) return phone;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    /**
     * Format date
     * @param {Date|string|number} date - Date to format
     * @param {string} format - Format string (yyyy-MM-dd, dd/MM/yyyy, etc)
     * @returns {string}
     */
    static formatDate(date, format = 'yyyy-MM-dd') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        switch (format) {
            case 'yyyy-MM-dd':
                return `${year}-${month}-${day}`;
            case 'dd/MM/yyyy':
                return `${day}/${month}/${year}`;
            case 'MM/dd/yyyy':
                return `${month}/${day}/${year}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }

    /**
     * Format student name (capitalize)
     * @param {string} name - Name to format
     * @returns {string}
     */
    static formatName(name) {
        return name
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} length - Max length
     * @returns {string}
     */
    static truncate(text, length = 50) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    /**
     * Clone object (deep copy)
     * @param {object} obj - Object to clone
     * @returns {object}
     */
    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Get element by ID
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    static getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Get elements by selector
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
    static getElements(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Hide element
     * @param {HTMLElement|string} element - Element or ID
     */
    static hide(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.classList.add('hidden');
    }

    /**
     * Show element
     * @param {HTMLElement|string} element - Element or ID
     */
    static show(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.classList.remove('hidden');
    }

    /**
     * Toggle element visibility
     * @param {HTMLElement|string} element - Element or ID
     */
    static toggle(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.classList.toggle('hidden');
    }

    /**
     * Add class to element
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} className - Class name
     */
    static addClass(element, className) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.classList.add(className);
    }

    /**
     * Remove class from element
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} className - Class name
     */
    static removeClass(element, className) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.classList.remove(className);
    }

    /**
     * Set element text content
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} text - Text content
     */
    static setText(element, text) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.textContent = text;
    }

    /**
     * Set element HTML content
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} html - HTML content
     */
    static setHTML(element, html) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el) el.innerHTML = html;
    }

    /**
     * Get form data
     * @param {HTMLFormElement} form - Form element
     * @returns {object}
     */
    static getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    /**
     * Debounce function
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {function}
     */
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     * @param {function} func - Function to throttle
     * @param {number} limit - Limit time in ms
     * @returns {function}
     */
    static throttle(func, limit = 300) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    /**
     * Copy to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise}
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Logger.info('Text copied to clipboard');
            return true;
        } catch (error) {
            Logger.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Download file
     * @param {string} url - File URL
     * @param {string} filename - File name
     */
    static downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Convert blob to base64
     * @param {Blob} blob - Blob to convert
     * @returns {Promise}
     */
    static async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Set page title
     * @param {string} title - Page title
     */
    static setTitle(title) {
        document.title = title;
    }

    /**
     * Set focus to element
     * @param {HTMLElement|string} element - Element or ID
     */
    static setFocus(element) {
        const el = typeof element === 'string' ? this.getElement(element) : element;
        if (el && typeof el.focus === 'function') {
            el.focus();
        }
    }

    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean}
     */
    static isEmpty(value) {
        return (
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)
        );
    }
}