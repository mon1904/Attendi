const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema({
    details: {
        firstname: { type: String },
        lastname: { type: String },
        profileImage: { type: String },
        gender: { type: String, index: true },
        address: { type: String }
    },
    parent1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    parent2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    schoolClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass'
    },
    dob: {
        type: Date
    },
    pps: {
        type: String
    },
    doctorName: {
        type: String
    },
    doctorPhone: {
        type: String
    }
});

module.exports.Student = mongoose.model('Student', StudentSchema);
