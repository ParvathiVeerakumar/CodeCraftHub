const express = require('express');
const userRoutes = require('./routes/userRoute');
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
