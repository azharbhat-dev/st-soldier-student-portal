/**
 * API Manager
 * Handles all communication with Google Apps Script backend
 */

class APIManager {
    constructor() {
        this.baseUrl = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
    }

    /**
     * Check if API URL is configured
     * @returns {boolean}
     */
    isConfigured() {
        return this.baseUrl && !this.baseUrl.includes('{SCRIPT_ID}');
    }

    /**
     * Make API request with retry logic
     * @param {object} data - Request data
     * @param {number} retries - Number of retries
     * @returns {Promise}
     */
    async request(data, retries = 3) {
        if (!this.isConfigured()) {
            Logger.error('API not configured. Set Google Apps Script URL in config.js');
            throw new Error('API not configured');
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            Logger.debug('API response:', result);

            return result;
        } catch (error) {
            if (error.name === 'AbortError') {
                Logger.error('API request timeout');
                throw new Error(CONFIG.ERRORS.NETWORK_ERROR);
            }

            if (retries > 0) {
                Logger.warn(`API request failed, retrying... (${retries} left)`, error.message);
                await this.delay(1000 * (4 - retries)); // Exponential backoff
                return this.request(data, retries - 1);
            }

            Logger.error('API request failed:', error.message);
            throw error;
        }
    }

    /**
     * Add student via API
     * @param {object} student - Student data
     * @returns {Promise}
     */
    async addStudent(student) {
        const cacheKey = 'students_list';
        Cache.remove(cacheKey);

        const response = await this.request({
            action: 'addStudent',
            student: student,
        });

        if (response.success) {
            Logger.info('Student added successfully', response);
            return response;
        } else {
            throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Get all students with caching
     * @returns {Promise}
     */
    async getStudents() {
        const cacheKey = 'students_list';

        // Try to get from cache first
        const cached = Cache.get(cacheKey);
        if (cached) {
            Logger.debug('Returning cached students');
            return { success: true, students: cached };
        }

        const response = await this.request({
            action: 'getStudents',
        });

        if (response.success && response.students) {
            // Cache the result
            Cache.set(cacheKey, response.students, CONFIG.CACHE.DURATION.STUDENTS);
            Logger.info('Students fetched and cached', response);
            return response;
        } else {
            throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Get single student by ID
     * @param {string} studentId - Student ID
     * @returns {Promise}
     */
    async getStudent(studentId) {
        const cacheKey = `student_${studentId}`;

        const cached = Cache.get(cacheKey);
        if (cached) {
            return { success: true, student: cached };
        }

        const response = await this.request({
            action: 'getStudent',
            studentId: studentId,
        });

        if (response.success && response.student) {
            Cache.set(cacheKey, response.student, CONFIG.CACHE.DURATION.STUDENTS);
            return response;
        } else {
            throw new Error(response.message || CONFIG.ERRORS.STUDENT_NOT_FOUND);
        }
    }

    /**
     * Update student data
     * @param {string} studentId - Student ID
     * @param {object} updates - Updated student data
     * @returns {Promise}
     */
    async updateStudent(studentId, updates) {
        Cache.remove(`student_${studentId}`);
        Cache.remove('students_list');

        const response = await this.request({
            action: 'updateStudent',
            studentId: studentId,
            updates: updates,
        });

        if (response.success) {
            Logger.info('Student updated successfully', response);
            return response;
        } else {
            throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Delete student
     * @param {string} studentId - Student ID
     * @returns {Promise}
     */
    async deleteStudent(studentId) {
        Cache.remove(`student_${studentId}`);
        Cache.remove('students_list');

        const response = await this.request({
            action: 'deleteStudent',
            studentId: studentId,
        });

        if (response.success) {
            Logger.info('Student deleted successfully', response);
            return response;
        } else {
            throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Generate unique student ID
     * @returns {Promise}
     */
    async generateStudentId() {
        const response = await this.request({
            action: 'generateStudentId',
        });

        if (response.success) {
            return response.studentId;
        } else {
            throw new Error(CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Save student ID card (as PDF)
     * @param {string} studentId - Student ID
     * @param {string} cardData - Card HTML/Data
     * @returns {Promise}
     */
    async saveIdCard(studentId, cardData) {
        const response = await this.request({
            action: 'saveIdCard',
            studentId: studentId,
            cardData: cardData,
        });

        if (response.success) {
            Logger.info('ID Card saved successfully');
            return response;
        } else {
            throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Get student by unique ID (for public access)
     * @param {string} uniqueId - Unique ID
     * @returns {Promise}
     */
    async getStudentByUniqueId(uniqueId) {
        const cacheKey = `student_unique_${uniqueId}`;

        const cached = Cache.get(cacheKey);
        if (cached) {
            return { success: true, student: cached };
        }

        const response = await this.request({
            action: 'getStudentByUniqueId',
            uniqueId: uniqueId,
        });

        if (response.success && response.student) {
            Cache.set(cacheKey, response.student, CONFIG.CACHE.DURATION.STUDENTS);
            return response;
        } else {
            throw new Error(CONFIG.ERRORS.STUDENT_NOT_FOUND);
        }
    }

    /**
     * Utility: delay execution
     * @param {number} ms - Milliseconds
     * @returns {Promise}
     * @private
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize global API manager
const API = new APIManager();