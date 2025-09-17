// Filename: models/WorkExperience.js

const mongoose = require('mongoose');

const WorkExperienceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    location: {
        type: String,
        required: false,
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: false
    },
    description: {
        type: String,
        trim: true
    },
    achievements: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('WorkExperience', WorkExperienceSchema);