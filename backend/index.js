// backend/index.js

const express = require('express');
const app = express();
const port = 5000; // or any other port

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Node.js backend!' });
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});