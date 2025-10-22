const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  startYear: Number,
  endYear: Number,
  technologies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technology' }]
}, { timestamps: true });

module.exports = mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
