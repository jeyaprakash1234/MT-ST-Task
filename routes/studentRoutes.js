const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Create Student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign or change mentor for a student
router.post('/:studentId/mentor/:mentorId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    const mentor = await Mentor.findById(req.params.mentorId);

    // Remove student from previous mentor's list
    if (student.mentor) {
      const previousMentor = await Mentor.findById(student.mentor);
      previousMentor.students.pull(student._id);
      await previousMentor.save();
    }

    student.mentor = mentor._id;
    mentor.students.push(student._id);

    await student.save();
    await mentor.save();

    res.status(200).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get previous mentor for a student
router.get('/:studentId/previous-mentor', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('mentor');
    res.status(200).json(student.mentor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
