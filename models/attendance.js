const mongoose = require('mongoose');

const AttendanceSchema = mongoose.Schema({
  schoolClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolClass'
  },
  date: Date,
  roll: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      status: String
    }
  ]
});

module.exports.Attendance = mongoose.model('Attendance', AttendanceSchema);
