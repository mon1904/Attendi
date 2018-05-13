const mongoose = require('mongoose');


const SchoolClassSchema = mongoose.Schema({
	name: String,
	teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teacherNotificationCount: {
    type: Number
  },
  parentNotificationCount: {
    type: Number
  }
});

module.exports.SchoolClass = mongoose.model('SchoolClass', SchoolClassSchema);
