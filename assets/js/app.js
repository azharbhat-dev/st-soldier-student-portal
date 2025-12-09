/**
 * Main Application
 * Initialization and event handling
 */

class App {
    constructor() {
        this.students = [];
        this.currentEditingStudent = null;
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        Logger.info('Initializing application');

        // Check API configuration
        if (!API.isConfigured()) {
            UIManager.showError(
                'API not configured. Please set Google Apps Script URL in config.js'
            );
        }

        // Setup event listeners
        this.setupEventListeners();

        // Check authentication
        if (Auth.isAuthenticated()) {
            this.showDashboard();
            this.loadStudents();
        } else {
            this.showLoginPage();
        }

        Logger.info('Application initialized successfully');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', e =>
            this.handleLogin(e)
        );

        // Student form
        document.getElementById('studentForm').addEventListener('submit', e =>
            this.handleAddStudent(e)
        );

        // Edit student form
        document.getElementById('editStudentForm').addEventListener('submit', e =>
            this.handleEditStudent(e)
        );

        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                UIManager.switchTab(tab);
                if (tab === 'viewStudents') {
                    this.loadStudents();
                }
            });
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', e => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    UIManager.hideModal(modal.id);
                }
            });
        });

        // ID Card modal close
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            UIManager.hideModal('idCardModal');
        });

        // Download PDF button
        document.getElementById('downloadCardBtn').addEventListener('click', () => {
            if (this.currentStudent) {
                IDCardManager.downloadCardPDF(this.currentStudent);
            }
        });

        // Edit modal buttons
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            UIManager.hideModal('editStudentModal');
        });

        // Close modals on background click
        document.getElementById('idCardModal').addEventListener('click', e => {
            if (e.target.id === 'idCardModal') {
                UIManager.hideModal('idCardModal');
            }
        });

        document.getElementById('editStudentModal').addEventListener('click', e => {
            if (e.target.id === 'editStudentModal') {
                UIManager.hideModal('editStudentModal');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                UIManager.hideModal('idCardModal');
                UIManager.hideModal('editStudentModal');
            }
        });

        Logger.debug('Event listeners setup completed');
    }

    /**
     * Handle login
     */
    async handleLogin(e) {
        e.preventDefault();

        const username = Utils.getElement('username').value.trim();
        const password = Utils.getElement('password').value.trim();

        if (!username || !password) {
            UIManager.showError('Please enter username and password');
            return;
        }

        try {
            const user = Auth.login(username, password);

            if (user) {
                UIManager.clearFormErrors(e.target);
                document.getElementById('loginForm').reset();
                this.showDashboard();
                this.loadStudents();
            } else {
                UIManager.showError(CONFIG.ERRORS.INVALID_CREDENTIALS);
            }
        } catch (error) {
            Logger.error('Login error:', error.message);
            UIManager.showError(CONFIG.ERRORS.GENERAL_ERROR);
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        Auth.logout();
        this.showLoginPage();
        Logger.info('User logged out');
    }

    /**
     * Handle add student
     */
    async handleAddStudent(e) {
        e.preventDefault();

        const form = e.target;
        UIManager.clearFormErrors(form);

        // Get form data
        const studentData = {
            name: Utils.getElement('studentName').value.trim(),
            fatherName: Utils.getElement('fatherName').value.trim(),
            email: Utils.getElement('studentEmail').value.trim().toLowerCase(),
            phone: Utils.getElement('studentPhone').value.trim(),
            course: Utils.getElement('course').value,
            semester: Utils.getElement('semester').value,
            rollNo: Utils.getElement('rollNo').value.trim().toUpperCase(),
        };

        // Validate
        const validation = Utils.validateStudentForm(studentData);
        if (!validation.valid) {
            UIManager.displayFormErrors(validation.errors, form);
            return;
        }

        try {
            UIManager.disableForm(form);

            const response = await StudentManager.addStudent(studentData);

            if (response.success) {
                form.reset();
                UIManager.enableForm(form, 'Add Student');

                // Reload students and switch to view tab
                setTimeout(() => {
                    this.loadStudents();
                    UIManager.switchTab('viewStudents');
                }, 1500);
            }
        } catch (error) {
            UIManager.enableForm(form, 'Add Student');
            Logger.error('Error adding student:', error.message);
        }
    }

    /**
     * Load and display students
     */
    async loadStudents() {
        try {
            this.students = await StudentManager.loadStudents();
            this.renderStudentsTable(this.students);
            UIManager.updateStudentCount(this.students.length);
        } catch (error) {
            Logger.error('Error loading students:', error.message);
            this.renderStudentsTable([]);
        }
    }

    /**
     * Render students table
     */
    renderStudentsTable(students) {
        const tbody = Utils.getElement('studentsTableBody');

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <p>No students added yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by creation date (newest first)
        const sorted = StudentManager.sortStudents(students, 'createdAt', 'desc');

        tbody.innerHTML = sorted
            .map(
                student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.rollNo}</td>
                <td>${student.course}</td>
                <td>${student.semester}</td>
                <td><strong>${student.id}</strong></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-small btn-generate" onclick="app.generateIDCard('${student.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                            Generate
                        </button>
                        <button class="btn-small btn-edit" onclick="app.editStudent('${student.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                        </button>
                        <button class="btn-small btn-delete" onclick="app.deleteStudent('${student.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `
            )
            .join('');

        Logger.debug(`Rendered ${students.length} students in table`);
    }

    /**
     * Generate ID card for student
     */
    async generateIDCard(studentId) {
        try {
            const student = await StudentManager.getStudent(studentId);
            this.currentStudent = student;
            IDCardManager.displayCard(student);
        } catch (error) {
            Logger.error('Error generating ID card:', error.message);
            UIManager.showError('Failed to generate ID card');
        }
    }

    /**
     * Edit student
     */
    async editStudent(studentId) {
        try {
            const student = await StudentManager.getStudent(studentId);
            this.currentEditingStudent = student;

            // Populate form
            Utils.getElement('editStudentId').value = student.id;
            Utils.getElement('editStudentName').value = student.name;
            Utils.getElement('editFatherName').value = student.fatherName;
            Utils.getElement('editStudentEmail').value = student.email;
            Utils.getElement('editStudentPhone').value = student.phone;
            Utils.getElement('editCourse').value = student.course;
            Utils.getElement('editSemester').value = student.semester;
            Utils.getElement('editRollNo').value = student.rollNo;

            UIManager.showModal('editStudentModal');
        } catch (error) {
            Logger.error('Error loading student for edit:', error.message);
            UIManager.showError('Failed to load student details');
        }
    }

    /**
     * Handle edit student
     */
    async handleEditStudent(e) {
        e.preventDefault();

        const form = e.target;
        UIManager.clearFormErrors(form);

        const studentId = Utils.getElement('editStudentId').value;
        const updates = {
            name: Utils.getElement('editStudentName').value.trim(),
            fatherName: Utils.getElement('editFatherName').value.trim(),
            email: Utils.getElement('editStudentEmail').value.trim().toLowerCase(),
            phone: Utils.getElement('editStudentPhone').value.trim(),
            course: Utils.getElement('editCourse').value,
            semester: Utils.getElement('editSemester').value,
            rollNo: Utils.getElement('editRollNo').value.trim().toUpperCase(),
        };

        // Validate
        const validation = Utils.validateStudentForm(updates);
        if (!validation.valid) {
            UIManager.displayFormErrors(validation.errors, form);
            return;
        }

        try {
            UIManager.disableForm(form);

            await StudentManager.updateStudent(studentId, updates);

            UIManager.hideModal('editStudentModal');
            form.reset();
            UIManager.enableForm(form, 'Update Student');

            // Reload students
            setTimeout(() => {
                this.loadStudents();
            }, 1500);
        } catch (error) {
            UIManager.enableForm(form, 'Update Student');
            Logger.error('Error updating student:', error.message);
        }
    }

    /**
     * Delete student
     */
    async deleteStudent(studentId) {
        const success = await StudentManager.deleteStudent(studentId);
        if (success) {
            this.loadStudents();
        }
    }

    /**
     * Show login page
     */
    showLoginPage() {
        // Prevent scrolling and hide dashboard
        document.body.classList.remove('dashboard-mode');
        document.body.classList.add('login-mode');
        document.body.style.overflow = 'hidden';
        
        // Hide dashboard elements
        const dashboardSection = Utils.getElement('dashboardSection');
        if (dashboardSection) {
            dashboardSection.style.display = 'none';
            dashboardSection.style.visibility = 'hidden';
            dashboardSection.classList.add('hidden');
        }
        
        // Show login
        Utils.show('loginSection');
        if (Utils.setTitle) {
            Utils.setTitle('Login - Student ID Card Generator');
        } else {
            document.title = 'Login - Student ID Card Generator';
        }
        Logger.debug('Showing login page');
    }

    /**
     * Show dashboard
     */
    showDashboard() {
        // Allow scrolling and show dashboard
        document.body.classList.remove('login-mode');
        document.body.classList.add('dashboard-mode');
        document.body.style.overflow = 'auto';
        
        // Hide login
        Utils.hide('loginSection');
        
        // Show dashboard
        const dashboardSection = Utils.getElement('dashboardSection');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
            dashboardSection.style.visibility = 'visible';
            dashboardSection.classList.remove('hidden');
        }
        
        const user = Auth.getCurrentUser();
        if (user) {
            Utils.setText('adminName', user.username || 'Admin');
        }
        if (Utils.setTitle) {
            Utils.setTitle('Student ID Card Generator - Dashboard');
        } else {
            document.title = 'Student ID Card Generator - Dashboard';
        }
        UIManager.switchTab('addStudent');
        Logger.debug('Showing dashboard');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new App();
    } catch (error) {
        console.error('Fatal application error:', error);
        const loginSection = document.getElementById('loginSection');
        if (loginSection) {
            loginSection.innerHTML = `
                <div class="login-container">
                    <div class="login-box">
                        <div class="login-header">
                            <h1 style="color: #e74c3c;">⚠️ Application Error</h1>
                        </div>
                        <p style="color: #666; margin-bottom: 20px;">
                            The application encountered an error during initialization.
                        </p>
                        <p style="color: #999; font-size: 12px; margin-bottom: 10px;">
                            Error: ${error.message}
                        </p>
                        <button onclick="location.reload()" style="
                            width: 100%;
                            padding: 10px;
                            background: #667eea;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Reload Page</button>
                    </div>
                </div>
            `;
        }
    }
});