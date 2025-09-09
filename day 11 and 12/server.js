const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const dbName = "projectdb";
const collectionName = "projects";

const app = express();
app.use(express.json());

let db;

// Async wrapper to handle errors in async routes
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Connect to MongoDB
async function connectToDb() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName);
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

// Simple route to list all projects
app.get('/api/projects', asyncHandler(async (req, res) => {
    const collection = db.collection(collectionName);
    const projects = await collection.find({}).toArray();
    res.status(200).json(projects);
}));

// Simple route to add a new project
app.post('/api/projects', asyncHandler(async (req, res) => {
    const collection = db.collection(collectionName);
    const newProject = req.body;
    if (!newProject || Object.keys(newProject).length === 0) {
        return res.status(400).json({ message: "Request body cannot be empty" });
    }
    const result = await collection.insertOne(newProject);
    res.status(201).json({ message: "Project created", id: result.insertedId });
}));

// PUT /api/projects/:id - Update a project by its ID
app.put('/api/projects/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Request body cannot be empty" });
    }

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    const collection = db.collection(collectionName);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updates };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).send();
    console.log(`Updated project with ID: ${id}`);
}));

// DELETE /api/projects/:id - Delete a project by its ID
app.delete('/api/projects/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    const collection = db.collection(collectionName);
    const filter = { _id: new ObjectId(id) };
    const result = await collection.deleteOne(filter);

    if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).send();
    console.log(`Deleted project with ID: ${id}`);
}));

// Centralized Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("An unexpected error occurred:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start the server after connecting to the database
const PORT = process.env.PORT || 3000;
connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});