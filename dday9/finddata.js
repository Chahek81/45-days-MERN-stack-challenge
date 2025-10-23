const { MongoClient } = require('mongodb');

// Connection URI
const uri = "mongodb://localhost:27017/resumeData";

// Create a new MongoClient
const client = new MongoClient(uri);

async function findResumes() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("🥳 Successfully connected to MongoDB!");
    
    // Select the database and collection
    const db = client.db();
    const collection = db.collection('resumes');

    // Find all documents in the collection
    const allResumes = await collection.find({}).toArray();

    // Print the documents to the terminal
    console.log("🔍 Resumes found:");
    console.log(allResumes);

  } catch (err) {
    console.error("❌ Failed to find data:", err);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Call the function to run the process
findResumes();