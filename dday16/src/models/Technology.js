const mongoose = require('mongoose');

const TechnologySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: String,
  popularity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Technology || mongoose.model('Technology', TechnologySchema);
