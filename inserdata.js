const { MongoClient } = require('mongodb');

// Connection URI
const uri = "mongodb://localhost:27017/resumeData";

// Create a new MongoClient
const client = new MongoClient(uri);

async function connectAndInsert() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("🥳 Successfully connected to MongoDB!");
    
    // Select the database and collection
    const db = client.db();
    const collection = db.collection('resumes');

    // Define the document you want to insert
    const newResume = {
      name: "Jane Doe",
      title: "Data Scientist",
      company: "Innovate Inc.",
      years_experience: 7
    };

    // Insert the document into the collection
    const result = await collection.insertOne(newResume);
    console.log(`✅ A document was inserted with the _id: ${result.insertedId}`);

  } catch (err) {
    console.error("❌ Failed to connect or insert data:", err);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Call the function to run the process
connectAndInsert();