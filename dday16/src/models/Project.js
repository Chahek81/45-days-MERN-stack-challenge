const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  technologies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technology' }],
  year: Number
}, { timestamps: true });

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
