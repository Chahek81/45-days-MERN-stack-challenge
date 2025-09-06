const { MongoClient } = require('mongodb');

// Connection URI for the local MongoDB instance.
// Replace 'resumeData' with your desired database name.
const uri = "mongodb://localhost:27017/resumeData";

// Create a new MongoClient
const client = new MongoClient(uri);

async function connectToServer() {
  try {
    // Connect the client to the server.
    await client.connect();
    
    // Check if the connection was successful.
    console.log("🥳 Successfully connected to MongoDB!");

    // You can now access your database and collections.
    const db = client.db();
    
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
  } finally {
    // Ensures that the client will close when you finish/error.
    await client.close();
  }
}

// Call the function to connect to the server.
connectToServer();