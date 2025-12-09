/**
 * UI Manager
 * Handles UI interactions, alerts, and modal management
 */

class UIManager {
    /**
     * Show success message
     * @param {string} message - Message text
     * @param {number} duration - Duration in ms
     */
    static showSuccess(message, duration = CONFIG.UI.TOAST_DURATION) {
        this.showAlert('successMsg', message, 'alert-success', duration);
    }

    /**
     * Show error message
     * @param {string} message - Message text
     * @param {number} duration - Duration in ms
     */
    static showError(message, duration = CONFIG.UI.TOAST_DURATION) {
        this.showAlert('errorMsg', message, 'alert-error', duration);
    }

    /**
     * Show warning message
     * @param {string} message - Message text
     * @param {number} duration - Duration in ms
     */
    static showWarning(message, duration = CONFIG.UI.TOAST_DURATION) {
        this.showAlert('errorMsg', message, 'alert-warning', duration);
    }

    /**
     * Show alert message
     * @private
     */
    static showAlert(elementId, message, className, duration) {
        const element = Utils.getElement(elementId);
        if (!element) return;

        // Remove previous class
        element.classList.remove('alert-success', 'alert-error', 'alert-warning', 'alert-info');

        // Add new class and message
        element.classList.add(className);
        Utils.setText(element, message);
        Utils.show(element);

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                Utils.hide(element);
            }, duration);
        }
    }

    /**
     * Show loading spinner
     */
    static showLoading() {
        Utils.show('loadingSpinner');
    }

    /**
     * Hide loading spinner
     */
    static hideLoading() {
        Utils.hide('loadingSpinner');
    }

    /**
     * Switch tabs
     * @param {string} tabName - Tab name
     */
    static switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('[id$="Tab"]').forEach(tab => {
            Utils.hide(tab);
        });

        // Remove active class from sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            Utils.removeClass(item, 'active');
        });

        // Show selected tab
        Utils.show(`${tabName}Tab`);

        // Add active class to sidebar item
        const activeItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeItem) {
            Utils.addClass(activeItem, 'active');
        }

        Logger.info(`Switched to tab: ${tabName}`);
    }

    /**
     * Show modal
     * @param {string} modalId - Modal ID
     */
    static showModal(modalId) {
        const modal = Utils.getElement(modalId);
        if (modal) {
            Utils.addClass(modal, 'show');
            document.body.style.overflow = 'hidden';
            Logger.debug(`Modal shown: ${modalId}`);
        }
    }

    /**
     * Hide modal
     * @param {string} modalId - Modal ID
     */
    static hideModal(modalId) {
        const modal = Utils.getElement(modalId);
        if (modal) {
            Utils.removeClass(modal, 'show');
            document.body.style.overflow = 'auto';
            Logger.debug(`Modal hidden: ${modalId}`);
        }
    }

    /**
     * Update student count
     * @param {number} count - Total students
     */
    static updateStudentCount(count) {
        Utils.setText('totalStudents', count.toString());
    }

    /**
     * Disable form submission
     * @param {HTMLFormElement} form - Form element
     */
    static disableForm(form) {
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            Utils.setText(button, 'Processing...');
        }
        Array.from(form.elements).forEach(element => {
            element.disabled = true;
        });
    }

    /**
     * Enable form submission
     * @param {HTMLFormElement} form - Form element
     * @param {string} buttonText - Button text
     */
    static enableForm(form, buttonText = 'Submit') {
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = false;
            Utils.setText(button, buttonText);
        }
        Array.from(form.elements).forEach(element => {
            element.disabled = false;
        });
    }

    /**
     * Validate and display form errors
     * @param {object} errors - Error object
     * @param {HTMLFormElement} form - Form element
     */
    static displayFormErrors(errors, form) {
        // Clear previous errors
        form.querySelectorAll('.form-error').forEach(el => (el.textContent = ''));

        // Display new errors
        Object.entries(errors).forEach(([field, message]) => {
            const errorElement = form.querySelector(`#${field}Error`);
            if (errorElement) {
                errorElement.textContent = message;
            }

            const input = form.querySelector(`#${field}`);
            if (input) {
                Utils.addClass(input.parentElement, 'error');
            }
        });
    }

    /**
     * Clear form errors
     * @param {HTMLFormElement} form - Form element
     */
    static clearFormErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => (el.textContent = ''));
        form.querySelectorAll('.error').forEach(el => Utils.removeClass(el, 'error'));
    }

    /**
     * Animate element
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} animationClass - Animation class
     */
    static animate(element, animationClass = 'fadeIn') {
        const el = typeof element === 'string' ? Utils.getElement(element) : element;
        if (el) {
            el.style.animation = `${animationClass} ${CONFIG.UI.ANIMATION_DURATION}ms ease-in-out`;
        }
    }

    /**
     * Confirm dialog
     * @param {string} message - Confirmation message
     * @returns {Promise<boolean>}
     */
    static confirm(message) {
        return Promise.resolve(window.confirm(message));
    }

    /**
     * Alert dialog
     * @param {string} message - Alert message
     * @returns {Promise}
     */
    static alert(message) {
        return Promise.resolve(window.alert(message));
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
        const el = typeof element === 'string' ? Utils.getElement(element) : element;
        if (el && typeof el.focus === 'function') {
            el.focus();
        }
    }
}