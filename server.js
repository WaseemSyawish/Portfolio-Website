const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();
console.log('MongoDB URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    projectUrl: String,
    githubUrl: String,
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

app.post('/api/portfolio', async (req, res) => {
    try {
        const portfolioItem = new Portfolio(req.body);
        await portfolioItem.save();
        res.status(201).json(portfolioItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const resumeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    organization: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    skillLevel: Number,
    order: { type: Number, default: 0 } 
});

const Resume = mongoose.model('Resume', resumeSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.get('/api/portfolio', async (req, res) => {
    try {
        const portfolioItems = await Portfolio.find().sort({ createdAt: -1 });
        res.json(portfolioItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); 

app.get('/api/portfolio/category/:category', async (req, res) => {
    try {
        const portfolioItems = await Portfolio.find({ 
            category: req.params.category 
        }).sort({ createdAt: -1 });
        res.json(portfolioItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/portfolio', async (req, res) => {
    try {
        const newPortfolioItem = new Portfolio(req.body);
        await newPortfolioItem.save();
        res.status(201).json(newPortfolioItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/portfolio/:id', async (req, res) => {
    try {
        const updatedPortfolioItem = await Portfolio.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedPortfolioItem) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }
        res.json(updatedPortfolioItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/portfolio/:id', async (req, res) => {
    try {
        const deletedPortfolioItem = await Portfolio.findByIdAndDelete(req.params.id);
        if (!deletedPortfolioItem) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }
        res.json({ message: 'Portfolio item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/resume/:type', async (req, res) => {
    try {
        const resumeItems = await Resume.find({ 
            type: req.params.type 
        }).sort({ order: 1 });
        res.json(resumeItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/resume', async (req, res) => {
    try {
        const newResumeItem = new Resume(req.body);
        await newResumeItem.save();
        res.status(201).json(newResumeItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/resume/:id', async (req, res) => {
    try {
        const updatedResumeItem = await Resume.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedResumeItem) {
            return res.status(404).json({ message: 'Resume item not found' });
        }
        res.json(updatedResumeItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/resume/:id', async (req, res) => {
    try {
        const deletedResumeItem = await Resume.findByIdAndDelete(req.params.id);
        if (!deletedResumeItem) {
            return res.status(404).json({ message: 'Resume item not found' });
        }
        res.json({ message: 'Resume item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL,
            subject: `Portfolio Contact: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `<h3>New Contact Form Submission</h3>
                   <p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Subject:</strong> ${subject}</p>
                   <p><strong>Message:</strong> ${message}</p>`
        };

        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.json({ 
            message: 'Login successful', 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
