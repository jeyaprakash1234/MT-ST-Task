const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Mentor = require('./models/mentor');
const Student = require('./models/student');

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://jpjo124:jpjo12345@cluster0.l0plrdk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());

// Route to create a mentor
app.post('/api/mentors', async (req, res) => {
  const { name } = req.body;
  try {
    const mentor = new Mentor({ name });
    await mentor.save();
    res.status(201).send(mentor);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Route to create a student
app.post('/api/students', async (req, res) => {
  const { name } = req.body;
  try {
    const student = new Student({ name });
    await student.save();
    res.status(201).send(student);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Route to assign students to a mentor
app.post('/api/mentors/:mentorId/students', async (req, res) => {
  const { mentorId } = req.params;
  const { studentIds } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).send({ error: 'Invalid mentor ID' });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).send({ error: 'Mentor not found' });
    }

    const validStudentIds = studentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const students = await Student.find({ _id: { $in: validStudentIds } });

    if (students.length !== studentIds.length) {
      return res.status(404).send({ error: 'One or more students not found' });
    }

    mentor.students.push(...students.map(student => student._id));
    await mentor.save();

    for (const student of students) {
      student.mentor = mentor._id;
      await student.save();
    }

    res.send(mentor);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
