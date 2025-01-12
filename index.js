const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017";
const dbName = "GitHub";

let db, users;

// Middleware
app.use(express.json());

// Connect to MongoDB
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri);
        console.log("Connected to MongoDB");
        db = client.db(dbName);
        users = db.collection("users");
        app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

// Helper function to validate ObjectId
const isValidObjectId = (id) => ObjectId.isValid(id);

// Routes

// GET: List all users
app.get('/users/:userId', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = req.body;
        const result = await users.insertOne(newUser);
        res.status(201).json({ message: "User added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding user: " + err.message);
    }
});

// PUT: Update a user completely
app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

        const updatedUser = req.body;
        const result = await users.replaceOne({ _id: new ObjectId(id) }, updatedUser);

        if (!result.matchedCount) return res.status(404).send("User not found");
        res.status(200).json({ message: "User updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
});

// PATCH: Partially update a user
app.patch('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

        const updates = req.body;
        const result = await users.updateOne({ _id: new ObjectId(id) }, { $set: updates });

        if (!result.matchedCount) return res.status(404).send("User not found");
        res.status(200).json({ message: "User updated", modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).send("Error partially updating user: " + err.message);
    }
});

// DELETE: Remove a user
// app.delete('/users/:userId', async (req, res) => {
//     try {
//         const id = req.params.id;
//         if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

//         const result = await users.deleteOne({ _id: new ObjectId(id) });

//         if (!result.deletedCount) return res.status(404).send("User not found");
//         res.status(200).json({ message: "User deleted", deletedCount: result.deletedCount });
//     } catch (err) {
//         res.status(500).send("Error deleting user: " + err.message);
//     }
// });

app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Use the correct parameter name from the route
        if (!ObjectId.isValid(userId)) return res.status(400).send("Invalid ID format");

        const result = await users.deleteOne({ _id: new ObjectId(userId) });

        if (!result.deletedCount) return res.status(404).send("User not found");
        res.status(200).json({ message: "User deleted", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});


//--------------------------------------------------------------------------------------------------------------------



let repositories; // Declare the variable for repositories collection

// Connect to MongoDB and initialize the repositories collection
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);

        // Initialize the repositories collection
        repositories = db.collection("repositories");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}


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



app.patch('/repositories/:repoId', async (req, res) => {
    try {
        const repoId = req.params.repoId; // Match the route parameter

        // Validate the ID format
        if (!ObjectId.isValid(repoId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const updates = req.body;

        // Perform the update
        const result = await repositories.updateOne(
            { _id: new ObjectId(repoId) },
            { $set: updates }
        );

        // Check if the repository was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Repository not found" });
        }

        res.status(200).json({
            message: "Repository updated successfully",
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        res.status(500).json({ error: "Error updating repository", details: err.message });
    }
});



// PATCH: Partially update a repository
app.patch('/repositories/:repoId', async (req, res) => {
    try {
        const id = req.params.repoId; // Use 'repoId' to match the route parameter
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
app.delete('/repositories/:repoId', async (req, res) => {
    try {
        const id = req.params.repoId; // Correctly use 'repoId' to match the route parameter
        if (!isValidObjectId(id)) return res.status(400).send("Invalid ID format");

        const result = await repositories.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return res.status(404).send("Repository not found");

        res.status(200).json({ message: "Repository deleted", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).send("Error deleting repository: " + err.message);
    }
});

//------------------------------------------------------------------------------------------


let issues; // Declare the variable for the issues collection

// Connect to MongoDB and initialize the issues collection
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);

        // Initialize the issues collection
        issues = db.collection("issues");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}


app.get('/repositories/:repoId/issues', async (req, res) => {
    try {
        const allIssues = await issues.find().toArray(); 
        res.status(200).json(allIssues);
    } catch (err) {
        res.status(500).send("Error fetching issues: " + err.message);
    }
});

app.post('/issues', async (req, res) => {
    try {
        const newIssue = req.body; // Accept issue data from request body
        const result = await issues.insertOne(newIssue); // Insert into the `issues` collection
        res.status(201).json({ message: "Issue added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding issue: " + err.message);
    }
});

app.patch('/issues/:issueId/status', async (req, res) => {
    try {
        const issueId = req.params.issueId; // Extract the issueId from the URL parameter

        // Validate if issueId is a valid ObjectId (assuming MongoDB ObjectId is used)
        if (!ObjectId.isValid(issueId)) {
            return res.status(400).json({ error: "Invalid issue ID format" });
        }

        const { status } = req.body; // Extract the status field from the request body
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        // Update the status of the issue in the collection
        const result = await issues.updateOne(
            { _id: new ObjectId(issueId) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Issue not found" });
        }

        res.status(200).json({
            message: "Issue status updated successfully",
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        res.status(500).json({ error: "Error updating issue status", details: err.message });
    }
});

// DELETE: Remove an issue
app.delete('/issues/:issueId', async (req, res) => {
    try {
        const id = req.params.issueId; // Use 'issueId' to match the route parameter

        // Validate the ID format
        if (!ObjectId.isValid(id)) {
            return res.status(400).send("Invalid ID format");
        }

        // Delete the issue
        const result = await issues.deleteOne({ _id: new ObjectId(id) });

        // Check if the issue was found and deleted
        if (result.deletedCount === 0) {
            return res.status(404).send("Issue not found");
        }

        res.status(200).json({ message: "Issue deleted", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).send("Error deleting issue: " + err.message);
    }
});

//--------------------------------------------------------------------------------------------------------------------------------------------


let pullRequests; // Declare the pullRequests collection

// Connect to MongoDB and initialize the collection
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        
        db = client.db(dbName);
        pullRequests = db.collection('pullRequests'); // Initialize the pullRequests collection

        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if database connection fails
    }
}


app.get('/repositories/:repoId/pullRequests', async (req, res) => {
    try {
        const allPullRequests = await pullRequests.find().toArray(); // Fetch all pull requests
        res.status(200).json(allPullRequests);
    } catch (err) {
        res.status(500).send("Error fetching pull requests: " + err.message);
    }
});

// POST: Add a new pull request
app.post('/pullRequests', async (req, res) => {
    try {
        const newPullRequest = req.body; // Accept pull request data from request body
        if (!newPullRequest) {
            return res.status(400).json({ error: "Invalid pull request data" });
        }

        const result = await pullRequests.insertOne(newPullRequest); // Insert into the `pullRequests` collection
        res.status(201).json({ message: "Pull request added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding pull request: " + err.message);
    }
});

// DELETE: Remove a pull request
app.delete('/pullRequests/:pullRequestId', async (req, res) => {
    try {
        const id = req.params.pullRequestId; // Use 'pullRequestId' to match the route parameter

        // Validate the ID format
        if (!ObjectId.isValid(id)) {
            return res.status(400).send("Invalid ID format");
        }

        // Delete the pull request
        const result = await pullRequests.deleteOne({ _id: new ObjectId(id) });

        // Check if the pull request was found and deleted
        if (result.deletedCount === 0) {
            return res.status(404).send("Pull request not found");
        }

        res.status(200).json({ message: "Pull request deleted", deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).send("Error deleting pull request: " + err.message);
    }
});

//-------------------------------------------------------------------------------------------------------------


let commits; // Declare the commits collection

// Connect to MongoDB and initialize the collection
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        
        db = client.db(dbName);
        commits = db.collection('commits'); // Initialize the commits collection

        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if database connection fails
    }
}

// GET: Fetch all commits for a repository
app.get('/repositories/:repoId/commits', async (req, res) => {
    try {
        const { repoId } = req.params; // Extract repoId from URL parameters

        // Ensure repoId is properly matched (if stored as a string or ObjectId)
        const allCommits = await commits.find({ repoId: repoId }).toArray();

        // If you store repoId as ObjectId in MongoDB, use:
        // const allCommits = await commits.find({ repoId: new ObjectId(repoId) }).toArray();

        // Check if any commits were found
        if (!allCommits || allCommits.length === 0) {
            return res.status(404).send("No commits found for the given repoId.");
        }

        res.status(200).json(allCommits);
    } catch (err) {
        console.error("Error fetching commits:", err);
        res.status(500).send("Error fetching commits: " + err.message);
    }
});


// POST: Add a new commit
app.post('/commits', async (req, res) => {
    try {
        const newCommit = req.body; // Accept commit data from request body
        if (!newCommit) {
            return res.status(400).json({ error: "Invalid commit data" });
        }

        const result = await commits.insertOne(newCommit); // Insert into the `commits` collection
        res.status(201).json({ message: "Commit added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding commit: " + err.message);
    }
});

// DELETE: Remove a commit

app.delete('/commits/:commitId', async (req, res) => {
    try {
        const id = req.params.commitId;

        // Determine if ID is valid ObjectId or string
        const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

        // Attempt to delete the commit
        const result = await commits.deleteOne(query);

        // Check if a document was deleted
        if (result.deletedCount === 0) {
            return res.status(404).send("Commit not found");
        }

        res.status(200).json({ message: "Commit deleted", deletedCount: result.deletedCount });
    } catch (err) {
        console.error("Error deleting commit:", err);
        res.status(500).send("Error deleting commit: " + err.message);
    }
});

//----------------------------------------------------------------------

let forks; // Declare the forks collection

// Connect to MongoDB and initialize the collection
async function initializeForksCollection() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        
        db = client.db(dbName);
        forks = db.collection('forks'); // Initialize the forks collection

        app.listen(3001, () => {
            console.log('Server for forks is running on http://localhost:3001');
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if database connection fails
    }
}

// Call this function to initialize the `forks` collection
initializeForksCollection();



app.post('/forks', async (req, res) => {
    try {
        const newFork = req.body; // Accept fork data from request body
        if (!newFork) {
            return res.status(400).json({ error: "Invalid fork data" });
        }

        const result = await forks.insertOne(newFork); // Insert into the `forks` collection
        res.status(201).json({ message: "Fork added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding fork: " + err.message);
    }
});

//----------------------------------------------------------


let stars; // Declare the stars collection

// Connect to MongoDB and initialize the collection
async function initializeStarsCollection() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        
        db = client.db(dbName);
        stars = db.collection('stars'); // Initialize the stars collection

        app.listen(3002, () => {
            console.log('Server for stars is running on http://localhost:3002');
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if database connection fails
    }
}

// Call this function to initialize the `stars` collection
initializeStarsCollection();



app.post('/stars', async (req, res) => {
    try {
        const newStar = req.body; // Accept star data from request body
        if (!newStar) {
            return res.status(400).json({ error: "Invalid star data" });
        }

        const result = await stars.insertOne(newStar); // Insert into the `stars` collection
        res.status(201).json({ message: "Star added", id: result.insertedId });
    } catch (err) {
        res.status(500).send("Error adding star: " + err.message);
    }
});
