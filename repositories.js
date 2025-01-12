const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "GitHub";

// Middleware
app.use(express.json());

let db, repositories;

// Connect to MongoDB and initialize the collection
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        repositories = db.collection("repositories");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

// Helper function for validating ObjectId
const isValidObjectId = (id) => ObjectId.isValid(id);

// Routes

// GET: List all repositories
app.get('/repositories/:repoId', async (req, res) => {
    try {
        const allRepositories = await repositories.find().toArray();
        res.status(200).json(allRepositories);
    } catch (err) {
        res.status(500).send("Error fetching repositories: " + err.message);
    }
});


// POST: Add a new repository
app.post('/repositories', async (req, res) => {
    try {
        const newRepo = req.body;
        const result = await repositories.insertOne(newRepo);
        res.status(201).json({ message: "Repository added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding repository: " + err.message);
    }
});

// PUT: Update a repository completely
app.put('/repositories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

        const updatedRepo = req.body;
        const result = await repositories.replaceOne({ _id: new ObjectId(id) }, updatedRepo);

        if (result.matchedCount === 0) return res.status(404).send("Repository not found");

        res.status(200).json({ message: "Repository updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).send("Error updating repository: " + err.message);
    }
});

// PATCH: Partially update a repository
app.patch('/repositories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

        const updates = req.body;
        const result = await repositories.updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (result.matchedCount === 0) return res.status(404).send("Repository not found");

        res.status(200).json({ message: "Repository updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).send("Error partially updating repository: " + err.message);
    }
});

// DELETE: Remove a repository
app.delete('/repositories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

        const result = await repositories.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return res.status(404).send("Repository not found");

        res.status(200).json({ message: "Repository deleted", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).send("Error deleting repository: " + err.message);
    }
});
