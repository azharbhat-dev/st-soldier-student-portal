/**
 * Student Card Viewer Application
 * Handles ID card loading, display, printing, and PDF export
 */

class StudentCardApp {
    constructor() {
        this.currentStudent = null;
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.focusInput();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const input = document.getElementById('studentIdInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.loadCard();
                }
            });
        }
    }

    /**
     * Focus on input field
     */
    focusInput() {
        const input = document.getElementById('studentIdInput');
        if (input) {
            input.focus();
        }
    }

    /**
     * Load student card
     */
    loadCard() {
        const studentId = document.getElementById('studentIdInput').value.trim();

        if (!studentId) {
            this.showError('Please enter a student ID');
            return;
        }

        this.showLoading('Loading card...');
        this.fetchStudentData(studentId);
    }

    /**
     * Fetch student data from API
     */
    async fetchStudentData(studentId) {
        try {
            if (!CONFIG || !CONFIG.API || !CONFIG.API.BASE_URL) {
                this.showError('API not configured');
                return;
            }

            const response = await fetch(CONFIG.API.BASE_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getStudent',
                    studentId: studentId
                })
            });

            const data = await response.json();

            if (data.success && data.student) {
                this.displayCard(data.student);
            } else {
                this.showError('Student ID not found');
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            this.showError('Error loading card. Please try again.');
        }
    }

    /**
     * Display student ID card
     */
    displayCard(student) {
        this.currentStudent = student;

        const cardHTML = this.generateCardHTML(student);
        document.getElementById('cardDisplay').innerHTML = cardHTML;
        document.getElementById('actionButtons').style.display = 'flex';
    }

    /**
     * Generate card HTML
     */
    generateCardHTML(student) {
        return `
            <div class="id-card">
                <div class="card-header">
                    <img src="https://stsoldiergroup.com/wp-content/uploads/2025/09/st-soldier-logo.png" 
                         alt="Logo" class="card-logo" loading="eager">
                    <div class="card-title">
                        <h4>ST SOLDIER GROUP</h4>
                        <p>STUDENT ID CARD</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-field">
                        <span class="card-label">Name</span>
                        <span class="card-value">${this.escape(student.name || 'N/A')}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Roll No</span>
                        <span class="card-value">${this.escape(student.rollNo || 'N/A')}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Father's Name</span>
                        <span class="card-value">${this.escape(student.fatherName || 'N/A')}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Course</span>
                        <span class="card-value">${this.escape(student.course || 'N/A')}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Semester</span>
                        <span class="card-value">${this.escape(student.semester || 'N/A')}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Email</span>
                        <span class="card-value">${this.escape(student.email || 'N/A')}</span>
                    </div>
                    <div class="card-id">
                        <div class="card-label">Student ID</div>
                        <div class="card-value">${this.escape(student.id)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Clear card display
     */
    clearCard() {
        document.getElementById('studentIdInput').value = '';
        this.currentStudent = null;
        this.showLoading('Enter a student ID to view card');
        document.getElementById('actionButtons').style.display = 'none';
        this.focusInput();
    }

    /**
     * Print card
     */
    printCard() {
        if (!this.currentStudent) {
            this.showError('Please load a student card first');
            return;
        }
        window.print();
    }

    /**
     * Download card as PDF
     */
    async downloadCard() {
        if (!this.currentStudent) {
            alert('Please load a student card first');
            return;
        }

        try {
            const cardElement = document.querySelector('.id-card');
            if (!cardElement) {
                alert('Card not found');
                return;
            }

            // Wait for images to load
            await new Promise(resolve => setTimeout(resolve, 1000));

            await PDFDownloadUtil.downloadElementAsPDF(
                cardElement,
                `Student-ID-${this.currentStudent.id}.pdf`
            );
            
            alert('PDF downloaded!');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        const cardDisplay = document.getElementById('cardDisplay');
        cardDisplay.innerHTML = `
            <div class="card-loading">
                <div class="spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError(message) {
        const cardDisplay = document.getElementById('cardDisplay');
        cardDisplay.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <div class="error-text">${message}</div>
            </div>
        `;
        document.getElementById('actionButtons').style.display = 'none';
    }

    /**
     * Escape HTML special characters
     */
    escape(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app instance globally
const studentCardApp = new StudentCardApp();