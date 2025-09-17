// Filename: routes/workExperienceRoutes.js

const express = require('express');
const router = express.Router();
const {
    createWorkExperience,
    getWorkExperiences,
    updateWorkExperience,
    deleteWorkExperience
} = require('../controllers/workExperienceController'); // Corrected path

router.route('/').get(getWorkExperiences).post(createWorkExperience);
router.route('/:id').put(updateWorkExperience).delete(deleteWorkExperience);

module.exports = router;