const mongoose = require('mongoose');


const MessageSchema = mongoose.Schema({
  messageStack: [
    {
      message: String,
      senderRole: String
    }
  ],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  parentNotificationCount: {
    type: Number
  },
  teacherNotificationCount: {
    type: Number
  },
});

module.exports.Message = mongoose.model('Message', MessageSchema);
