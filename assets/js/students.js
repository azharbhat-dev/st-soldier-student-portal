/**
 * Student Manager
 * Handles student operations (CRUD)
 */

class StudentManager {
    /**
     * Add new student
     * @param {object} studentData - Student information
     * @returns {Promise}
     */
    static async addStudent(studentData) {
        try {
            UIManager.showLoading();

            // Generate unique ID
            const studentId = Utils.generateUniqueId('STU');

            const student = {
                id: studentId,
                name: Utils.formatName(studentData.name),
                fatherName: Utils.formatName(studentData.fatherName),
                email: studentData.email.toLowerCase(),
                phone: Utils.formatPhone(studentData.phone),
                course: studentData.course,
                semester: studentData.semester,
                rollNo: studentData.rollNo.toUpperCase(),
                createdAt: new Date().toISOString(),
            };

            // Call API
            const response = await API.addStudent(student);

            UIManager.hideLoading();

            if (response.success) {
                UIManager.showSuccess(CONFIG.SUCCESS.STUDENT_ADDED);
                return response;
            } else {
                throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
            }
        } catch (error) {
            UIManager.hideLoading();
            Logger.error('Error adding student:', error.message);
            UIManager.showError(error.message || CONFIG.ERRORS.GENERAL_ERROR);
            throw error;
        }
    }

    /**
     * Load all students
     * @returns {Promise}
     */
    static async loadStudents() {
        try {
            UIManager.showLoading();
            const response = await API.getStudents();
            UIManager.hideLoading();

            if (response.success) {
                return response.students || [];
            } else {
                throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
            }
        } catch (error) {
            UIManager.hideLoading();
            Logger.error('Error loading students:', error.message);
            UIManager.showError(error.message);
            return [];
        }
    }

    /**
     * Update student
     * @param {string} studentId - Student ID
     * @param {object} updates - Updated data
     * @returns {Promise}
     */
    static async updateStudent(studentId, updates) {
        try {
            UIManager.showLoading();

            const formattedUpdates = {
                name: updates.name ? Utils.formatName(updates.name) : undefined,
                fatherName: updates.fatherName ? Utils.formatName(updates.fatherName) : undefined,
                email: updates.email ? updates.email.toLowerCase() : undefined,
                phone: updates.phone ? Utils.formatPhone(updates.phone) : undefined,
                course: updates.course,
                semester: updates.semester,
                rollNo: updates.rollNo ? updates.rollNo.toUpperCase() : undefined,
            };

            // Remove undefined values
            Object.keys(formattedUpdates).forEach(
                key => formattedUpdates[key] === undefined && delete formattedUpdates[key]
            );

            const response = await API.updateStudent(studentId, formattedUpdates);
            UIManager.hideLoading();

            if (response.success) {
                UIManager.showSuccess(CONFIG.SUCCESS.STUDENT_UPDATED);
                return response;
            } else {
                throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
            }
        } catch (error) {
            UIManager.hideLoading();
            Logger.error('Error updating student:', error.message);
            UIManager.showError(error.message);
            throw error;
        }
    }

    /**
     * Delete student
     * @param {string} studentId - Student ID
     * @returns {Promise}
     */
    static async deleteStudent(studentId) {
        try {
            const confirmed = await UIManager.confirm(
                'Are you sure you want to delete this student? This action cannot be undone.'
            );

            if (!confirmed) return false;

            UIManager.showLoading();
            const response = await API.deleteStudent(studentId);
            UIManager.hideLoading();

            if (response.success) {
                UIManager.showSuccess(CONFIG.SUCCESS.STUDENT_DELETED);
                return true;
            } else {
                throw new Error(response.message || CONFIG.ERRORS.GENERAL_ERROR);
            }
        } catch (error) {
            UIManager.hideLoading();
            Logger.error('Error deleting student:', error.message);
            UIManager.showError(error.message);
            return false;
        }
    }

    /**
     * Get student by ID
     * @param {string} studentId - Student ID
     * @returns {Promise}
     */
    static async getStudent(studentId) {
        try {
            const response = await API.getStudent(studentId);
            if (response.success) {
                return response.student;
            } else {
                throw new Error(CONFIG.ERRORS.STUDENT_NOT_FOUND);
            }
        } catch (error) {
            Logger.error('Error getting student:', error.message);
            throw error;
        }
    }

    /**
     * Search students
     * @param {string} query - Search query
     * @param {array} students - Students to search
     * @returns {array}
     */
    static searchStudents(query, students) {
        const lowerQuery = query.toLowerCase();
        return students.filter(student => {
            return (
                student.name.toLowerCase().includes(lowerQuery) ||
                student.rollNo.toLowerCase().includes(lowerQuery) ||
                student.email.toLowerCase().includes(lowerQuery) ||
                student.id.toLowerCase().includes(lowerQuery)
            );
        });
    }

    /**
     * Sort students
     * @param {array} students - Students to sort
     * @param {string} field - Field to sort by
     * @param {string} order - 'asc' or 'desc'
     * @returns {array}
     */
    static sortStudents(students, field = 'createdAt', order = 'desc') {
        const sorted = [...students];
        sorted.sort((a, b) => {
            const aValue = a[field];
            const bValue = b[field];

            if (typeof aValue === 'string') {
                return order === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            } else {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }
        });

        return sorted;
    }
}