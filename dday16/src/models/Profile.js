const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: String,
  headline: String,
  skills: [{ type: String }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }]
}, { timestamps: true });

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
