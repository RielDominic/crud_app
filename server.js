// Import Required Modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/studentsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable cross-origin resource sharing
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Define student schema
const studentSchema = new mongoose.Schema({
    studentNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    photo: { type: String }
});

const Student = mongoose.model('Student', studentSchema);

// Create Student
app.post('/students', upload.single('photo'), async (req, res) => {
    try {
        const { studentNumber, name, email, gender, contactNumber, address } = req.body;
        const photo = req.file ? `/uploads/${req.file.filename}` : '';

        console.log("Received data:", { studentNumber, name, email, gender, contactNumber, address, photo });

        const newStudent = new Student({ studentNumber, name, email, gender, contactNumber, address, photo });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Error saving student:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update student
app.put('/students/:id', upload.single('photo'), async (req, res) => {
    try {
        const { studentNumber, name, email, gender, contactNumber, address } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete old image if new one is uploaded
        if (req.file && student.photo) {
            const oldImagePath = path.join(__dirname, student.photo);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Update student data
        student.studentNumber = studentNumber || student.studentNumber;
        student.name = name || student.name;
        student.email = email || student.email;
        student.gender = gender || student.gender;
        student.contactNumber = contactNumber || student.contactNumber;
        student.address = address || student.address;
        student.photo = req.file ? `/uploads/${req.file.filename}` : student.photo;

        console.log("Updated data:", { studentNumber, name, email, gender, contactNumber, address, photo: student.photo });

        await student.save();
        res.json(student);
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete student
app.delete('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete student image from server
        if (student.photo) {
            const oldImagePath = path.join(__dirname, student.photo);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));