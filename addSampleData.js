require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define the Portfolio Schema (matching your server.js schema)
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

const sampleProjects = [
    {
        title: "E-commerce Website",
        category: "web",
        description: "A full-stack e-commerce platform built with Node.js and React",
        imageUrl: "https://via.placeholder.com/600x400",
        projectUrl: "https://github.com/WaseemSyawish",
        githubUrl: "https://github.com/WaseemSyawish",
        featured: true
    },
    {
        title: "Weather App",
        category: "app",
        description: "Real-time weather application using weather API",
        imageUrl: "https://via.placeholder.com/600x400",
        projectUrl: "https://github.com/WaseemSyawish/User-login-and-registration",
        githubUrl: "https://github.com/WaseemSyawish",
        featured: false
    },
    {
        title: "Task Manager",
        category: "web",
        description: "A productivity app for managing daily tasks and projects",
        imageUrl: "https://via.placeholder.com/600x400",
        projectUrl: "https://github.com/WaseemSyawish",
        githubUrl: "https://github.com/WaseemSyawish",
        featured: true
    },
    {
        title: "Portfolio Website",
        category: "ui",
        description: "Modern portfolio website with dynamic content management",
        imageUrl: "https://via.placeholder.com/600x400",
        projectUrl: "https://github.com/WaseemSyawish",
        githubUrl: "https://github.com/WaseemSyawish",
        featured: true
    },
    {
        title: "Social Media Dashboard",
        category: "ui",
        description: "Analytics dashboard for social media management",
        imageUrl: "https://via.placeholder.com/600x400",
        projectUrl: "https://github.com/WaseemSyawish",
        githubUrl: "https://github.com/WaseemSyawish",
        featured: false
    },
    {
        title: "Mobile Game",
        category: "app",
        description: "2D platformer game developed with Unity",
        imageUrl: "https://via.placeholder.com/600x400",
        projectUrl: "https://github.com/WaseemSyawish",
        githubUrl: "https://github.com/WaseemSyawish",
        featured: true
    }
];

const addSampleData = async () => {
    try {
        // Clear existing data
        await Portfolio.deleteMany({});
        
        // Add new sample data
        const result = await Portfolio.insertMany(sampleProjects);
        console.log('Sample data added successfully:', result);
        
    } catch (error) {
        console.error('Error adding sample data:', error);
    } finally {
        mongoose.connection.close();
    }
};

addSampleData();