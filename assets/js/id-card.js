/**
 * ID Card Manager
 * Handles ID card generation, rendering, and PDF export
 */

class IDCardManager {
    /**
     * Generate HTML for ID card
     * @param {object} student - Student data
     * @returns {string} - HTML string
     */
    static generateCardHTML(student) {
        return `
            <div class="id-card">
                <div class="card-header">
                    <img src="${CONFIG.ID_CARD.LOGO_URL}" alt="Logo" class="card-logo">
                    <div class="card-title">
                        <h4>ST SOLDIER GROUP</h4>
                        <p>STUDENT ID CARD</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-field">
                        <span class="card-label">Name</span>
                        <span class="card-value">${student.name}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Roll No</span>
                        <span class="card-value">${student.rollNo}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Father's Name</span>
                        <span class="card-value">${student.fatherName}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Semester</span>
                        <span class="card-value">${student.semester}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Course</span>
                        <span class="card-value">${student.course}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-label">Email</span>
                        <span class="card-value">${student.email}</span>
                    </div>
                    <div class="card-id">
                        <div class="card-label">Student ID</div>
                        <div class="card-value">${student.id}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Display ID card in modal
     * @param {object} student - Student data
     */
    static displayCard(student) {
        const cardHTML = this.generateCardHTML(student);
        Utils.setHTML('idCardPreview', cardHTML);
        UIManager.showModal('idCardModal');
        Logger.info('ID card displayed for student:', student.id);
    }

    /**
     * Download ID card as PDF
     * @param {object} student - Student data
     */
    static async downloadCardPDF(student) {
        try {
            UIManager.showLoading();

            // Load html2canvas if not already loaded
            if (typeof html2canvas === 'undefined') {
                await this.loadLibrary(
                    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
                );
            }

            // Load jsPDF if not already loaded
            if (typeof jsPDF === 'undefined') {
                await this.loadLibrary(
                    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
                );
            }

            const element = Utils.getElement('idCardPreview').querySelector('.id-card');

            if (!element) {
                throw new Error('ID Card element not found');
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [216, 137],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 216, 137);
            pdf.save(`STU-ID-${student.id}.pdf`);

            UIManager.hideLoading();
            UIManager.showSuccess('ID Card downloaded successfully!');
            Logger.info('ID card PDF generated for student:', student.id);
        } catch (error) {
            UIManager.hideLoading();
            Logger.error('Error generating PDF:', error.message);
            UIManager.showError('Failed to download ID card');
        }
    }

    /**
     * Load external library
     * @private
     */
    static loadLibrary(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Print ID card
     * @param {object} student - Student data
     */
    static printCard(student) {
        const cardHTML = this.generateCardHTML(student);
        const printWindow = window.open('', '', 'height=400,width=600');
        printWindow.document.write('<html><head><title>ID Card</title>');
        printWindow.document.write('<link rel="stylesheet" href="assets/css/id-card.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(cardHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Share ID card
     * @param {object} student - Student data
     */
    static async shareCard(student) {
        const shareText = `Student ID: ${student.id}\nName: ${student.name}\nRoll Number: ${student.rollNo}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Student ID Card`,
                    text: shareText,
                });
            } catch (error) {
                Logger.warn('Share failed:', error.message);
            }
        } else {
            // Fallback: copy to clipboard
            const success = await Utils.copyToClipboard(shareText);
            if (success) {
                UIManager.showSuccess('ID information copied to clipboard');
            }
        }
    }

    /**
     * Export multiple ID cards
     * @param {array} students - Students array
     */
    static async exportBatch(students) {
        try {
            UIManager.showLoading();

            if (typeof html2canvas === 'undefined' || typeof jsPDF === 'undefined') {
                await this.loadLibrary(
                    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
                );
                await this.loadLibrary(
                    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
                );
            }

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            let pageCount = 0;

            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                const cardHTML = this.generateCardHTML(student);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHTML;
                tempDiv.style.display = 'none';
                document.body.appendChild(tempDiv);

                const canvas = await html2canvas(tempDiv.querySelector('.id-card'), {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#fff',
                });

                const imgData = canvas.toDataURL('image/png');

                if (pageCount > 0) {
                    pdf.addPage();
                }

                pdf.addImage(imgData, 'PNG', 20, 30, 170, 100);
                pageCount++;

                document.body.removeChild(tempDiv);

                // Update progress
                Logger.debug(`Processed ${i + 1}/${students.length} cards`);
            }

            pdf.save(`Student-IDs-${Date.now()}.pdf`);

            UIManager.hideLoading();
            UIManager.showSuccess(`${students.length} ID cards exported successfully!`);
        } catch (error) {
            UIManager.hideLoading();
            Logger.error('Error exporting batch:', error.message);
            UIManager.showError('Failed to export ID cards');
        }
    }

    /**
     * Generate QR code (placeholder)
     * @param {string} data - Data to encode
     * @returns {string} - QR code SVG
     */
    static generateQRCode(data) {
        // This would integrate with a QR code library
        // Placeholder for now
        return null;
    }
}