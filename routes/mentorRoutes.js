const express = require('express');
const router = express.Router();
const Mentor = require('../models/mentor');

// Create Mentor
router.post('/', async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json(mentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign students to a mentor
router.post('/:mentorId/students', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    const students = await Student.find({ _id: { $in: req.body.studentIds }, mentor: null });
    
    students.forEach(student => {
      student.mentor = mentor._id;
      mentor.students.push(student._id);
    });

    await mentor.save();
    await Student.updateMany(
      { _id: { $in: req.body.studentIds } },
      { mentor: mentor._id }
    );

    res.status(200).json(mentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all students for a mentor
router.get('/:mentorId/students', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId).populate('students');
    res.status(200).json(mentor.students);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
