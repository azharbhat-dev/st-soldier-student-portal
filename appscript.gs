/**
 * Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Get the Sheet ID from URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
 * 3. Replace SPREADSHEET_ID below with your actual ID
 * 4. In Google Apps Script Editor, click Deploy > New Deployment
 * 5. Type: Web App
 * 6. Execute as: Your account
 * 7. Who has access: Anyone
 * 8. Copy deployment URL and paste in config.js
 */

// IMPORTANT: Replace this with your Google Sheet ID
// Get from URL: https://docs.google.com/spreadsheets/d/{THIS_ID}/edit
const SPREADSHEET_ID = '1jAcF3m43_X5sLOB0qwtUsRDAxduOLgAZ1WjpYjmIB90';

// Sheet names
const SHEET_NAMES = {
    STUDENTS: 'Students',
    LOGS: 'Logs',
};

// Map sheet headers to object keys
const HEADER_TO_KEY_MAP = {
    'ID': 'id',
    'Name': 'name',
    'Father Name': 'fatherName',
    'Email': 'email',
    'Phone': 'phone',
    'Course': 'course',
    'Semester': 'semester',
    'Roll Number': 'rollNo',
    'Created At': 'createdAt',
    'Updated At': 'updatedAt',
};

// Get spreadsheet by ID
function getSpreadsheet() {
    try {
        if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
            throw new Error('SPREADSHEET_ID not configured! Replace YOUR_GOOGLE_SHEET_ID_HERE with your actual Google Sheet ID');
        }
        
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        if (!ss) {
            throw new Error('Unable to open spreadsheet with ID: ' + SPREADSHEET_ID);
        }
        return ss;
    } catch (error) {
        Logger.log('Error getting spreadsheet:', error.toString());
        throw error;
    }
}

// Get or create sheet
function getSheet(sheetName) {
    try {
        const ss = getSpreadsheet();
        
        // Get all sheets
        const sheets = ss.getSheets();
        
        // Find sheet by name
        let sheet = null;
        for (let i = 0; i < sheets.length; i++) {
            if (sheets[i].getName() === sheetName) {
                sheet = sheets[i];
                break;
            }
        }

        // Create if doesn't exist
        if (!sheet) {
            Logger.log(`Creating new sheet: ${sheetName}`);
            sheet = ss.insertSheet(sheetName);
            initializeSheet(sheet, sheetName);
        }

        return sheet;
    } catch (error) {
        Logger.log('Error getting sheet:', error);
        throw error;
    }
}

// Initialize sheet with headers
function initializeSheet(sheet, sheetName) {
    if (sheetName === SHEET_NAMES.STUDENTS) {
        const headers = [
            'ID',
            'Name',
            'Father Name',
            'Email',
            'Phone',
            'Course',
            'Semester',
            'Roll Number',
            'Created At',
            'Updated At',
        ];
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);

        // Format header
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setBackground('#667eea');
        headerRange.setFontColor('white');
        headerRange.setFontWeight('bold');
    } else if (sheetName === SHEET_NAMES.LOGS) {
        const headers = ['Timestamp', 'Action', 'Student ID', 'Details'];
        sheet.appendRow(headers);
        sheet.setFrozenRows(1);
    }
}

// Main request handler
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        let response = {};

        switch (action) {
            case 'addStudent':
                response = addStudent(data.student);
                break;
            case 'getStudents':
                response = getStudents();
                break;
            case 'getStudent':
                response = getStudent(data.studentId);
                break;
            case 'updateStudent':
                response = updateStudent(data.studentId, data.updates);
                break;
            case 'deleteStudent':
                response = deleteStudent(data.studentId);
                break;
            case 'generateStudentId':
                response = { success: true, studentId: generateUniqueId() };
                break;
            default:
                response = { success: false, message: 'Invalid action' };
        }

        return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
            ContentService.MimeType.JSON
        );
    } catch (error) {
        const errorResponse = {
            success: false,
            message: error.toString(),
        };

        return ContentService.createTextOutput(JSON.stringify(errorResponse)).setMimeType(
            ContentService.MimeType.JSON
        );
    }
}

/**
 * Add new student
 */
function addStudent(student) {
    try {
        // Validate required fields
        if (!student.name || !student.rollNo) {
            return { success: false, message: 'Missing required fields' };
        }

        // Check for duplicate roll number
        const students = getAllStudents();
        if (students.some(s => s.rollNo === student.rollNo)) {
            return { success: false, message: 'Student with this roll number already exists' };
        }

        const sheet = getSheet(SHEET_NAMES.STUDENTS);
        const timestamp = new Date().toISOString();

        const rowData = [
            student.id,
            student.name,
            student.fatherName,
            student.email,
            student.phone,
            student.course,
            student.semester,
            student.rollNo,
            timestamp,
            timestamp,
        ];

        sheet.appendRow(rowData);

        // Log action
        logAction('ADD_STUDENT', student.id, `Added student: ${student.name}`);

        return {
            success: true,
            message: 'Student added successfully',
            studentId: student.id,
        };
    } catch (error) {
        Logger.log('Error in addStudent:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Get all students
 */
function getStudents() {
    try {
        const students = getAllStudents();
        return {
            success: true,
            students: students,
            count: students.length,
        };
    } catch (error) {
        Logger.log('Error in getStudents:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Get all students (helper function)
 * FIXED: Properly maps sheet headers to object keys
 */
function getAllStudents() {
    const sheet = getSheet(SHEET_NAMES.STUDENTS);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
        return [];
    }

    const headers = data[0];
    const students = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue; // Skip empty rows

        const student = {};
        
        // Use the header mapping to properly convert field names
        headers.forEach((header, index) => {
            const key = HEADER_TO_KEY_MAP[header] || header.toLowerCase().replace(' ', '_');
            student[key] = row[index];
        });

        students.push(student);
    }

    Logger.log('Student data retrieved:', students);
    return students;
}

/**
 * Get single student by ID
 */
function getStudent(studentId) {
    try {
        const students = getAllStudents();
        const student = students.find(s => s.id === studentId);

        if (!student) {
            return { success: false, message: 'Student not found' };
        }

        Logger.log('Retrieved student:', student);
        return { success: true, student: student };
    } catch (error) {
        Logger.log('Error in getStudent:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Update student
 */
function updateStudent(studentId, updates) {
    try {
        const sheet = getSheet(SHEET_NAMES.STUDENTS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];

        let found = false;

        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === studentId) {
                found = true;

                // Update fields using reverse mapping
                Object.keys(updates).forEach(key => {
                    // Find the header that maps to this key
                    let headerName = null;
                    for (const [header, mappedKey] of Object.entries(HEADER_TO_KEY_MAP)) {
                        if (mappedKey === key) {
                            headerName = header;
                            break;
                        }
                    }

                    if (headerName) {
                        const colIndex = headers.indexOf(headerName);
                        if (colIndex !== -1) {
                            sheet.getRange(i + 1, colIndex + 1).setValue(updates[key]);
                        }
                    }
                });

                // Update timestamp
                const updatedAtIndex = headers.indexOf('Updated At');
                if (updatedAtIndex !== -1) {
                    sheet.getRange(i + 1, updatedAtIndex + 1).setValue(
                        new Date().toISOString()
                    );
                }

                logAction('UPDATE_STUDENT', studentId, 'Updated student details');
                break;
            }
        }

        if (!found) {
            return { success: false, message: 'Student not found' };
        }

        return { success: true, message: 'Student updated successfully' };
    } catch (error) {
        Logger.log('Error in updateStudent:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Delete student
 */
function deleteStudent(studentId) {
    try {
        const sheet = getSheet(SHEET_NAMES.STUDENTS);
        const data = sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === studentId) {
                sheet.deleteRow(i + 1);
                logAction('DELETE_STUDENT', studentId, 'Deleted student');
                return { success: true, message: 'Student deleted successfully' };
            }
        }

        return { success: false, message: 'Student not found' };
    } catch (error) {
        Logger.log('Error in deleteStudent:', error);
        return { success: false, message: error.toString() };
    }
}

/**
 * Generate unique student ID
 */
function generateUniqueId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase();
    return `STU${timestamp}${random}`;
}

/**
 * Log action to audit sheet
 */
function logAction(action, studentId, details) {
    try {
        const sheet = getSheet(SHEET_NAMES.LOGS);
        const timestamp = new Date().toISOString();
        sheet.appendRow([timestamp, action, studentId, details]);
    } catch (error) {
        Logger.log('Error logging action:', error);
    }
}

/**
 * Test function (remove in production)
 */
function testAddStudent() {
    const testStudent = {
        id: generateUniqueId(),
        name: 'Test Student',
        fatherName: 'Test Father',
        email: 'test@example.com',
        phone: '9999999999',
        course: 'B.Tech (Computer Science)',
        semester: '1',
        rollNo: 'TS001',
    };

    const response = addStudent(testStudent);
    Logger.log('Test response:', response);
}