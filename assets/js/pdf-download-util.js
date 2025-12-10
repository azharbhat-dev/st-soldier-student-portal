/**
 * PDF Download - Uses Browser Print
 */

const PDFDownloadUtil = {
    async downloadElementAsPDF(element, filename) {
        try {
            // Hide everything except the card
            const body = document.body;
            const originalHTML = body.innerHTML;

            // Create a clean print layout
            const printDiv = document.createElement('div');
            printDiv.style.padding = '20mm';
            printDiv.style.backgroundColor = 'white';
            
            // Clone and add card
            const cardClone = element.cloneNode(true);
            printDiv.appendChild(cardClone);

            // Replace body content
            body.innerHTML = '';
            body.appendChild(printDiv);

            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 500));

            // Trigger print
            window.print();

            // Restore original after print dialog closes
            await new Promise(resolve => {
                setTimeout(() => {
                    body.innerHTML = originalHTML;
                    resolve();
                }, 500);
            });

            return true;
        } catch (error) {
            console.error('Print Error:', error);
            throw error;
        }
    },

    async loadLibraries() {
        // Not needed for print method
        return Promise.resolve();
    }
};