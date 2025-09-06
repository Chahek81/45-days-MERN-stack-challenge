// The URL of your API endpoint
const url = 'http://localhost:3000/api/projects';

// The data you want to send
const projectData = {
  name: "My New Project",
  description: "This is a new project from a web client."
};

// Send the POST request
fetch(url, {
  method: 'POST', // The HTTP method
  headers: {
    'Content-Type': 'application/json', // The type of content in the body
  },
  body: JSON.stringify(projectData) // The data, converted to a JSON string
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error);
});