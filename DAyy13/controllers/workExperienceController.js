// Filename: controllers/workExperienceController.js

const WorkExperience = require('../models/workExperience'); // Corrected path
const asyncHandler = require('express-async-handler');

// @desc    Create a new work experience entry
// @route   POST /api/work-experience
// @access  Public
exports.createWorkExperience = asyncHandler(async (req, res) => {
    const workExperience = await WorkExperience.create(req.body);
    res.status(201).json({ success: true, data: workExperience });
});

// @desc    Get all work experience entries
// @route   GET /api/work-experience
// @access  Public
exports.getWorkExperiences = asyncHandler(async (req, res) => {
    const workExperiences = await WorkExperience.find({});
    res.status(200).json({ success: true, count: workExperiences.length, data: workExperiences });
});

// @desc    Update a work experience entry
// @route   PUT /api/work-experience/:id
// @access  Public
exports.updateWorkExperience = asyncHandler(async (req, res) => {
    const workExperience = await WorkExperience.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!workExperience) {
        res.status(404);
        throw new Error('Work experience entry not found');
    }
    res.status(200).json({ success: true, data: workExperience });
});

// @desc    Delete a work experience entry
// @route   DELETE /api/work-experience/:id
// @access  Public
exports.deleteWorkExperience = asyncHandler(async (req, res) => {
    const workExperience = await WorkExperience.findByIdAndDelete(req.params.id);
    if (!workExperience) {
        res.status(404);
        throw new Error('Work experience entry not found');
    }
    res.status(200).json({ success: true, message: 'Entry removed successfully' });
});