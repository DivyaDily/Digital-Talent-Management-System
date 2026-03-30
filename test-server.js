const express = require('express');
const app = express();

console.log('Creating DELETE route...');

app.delete('/api/tasks/:id', (req, res) => {
    console.log('DELETE /api/tasks/:id called');
    res.json({ message: 'Delete works', id: req.params.id });
});

console.log('Routes registered');

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
