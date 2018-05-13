const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    email: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
	details: {
		firstname: { type: String },
		lastname: { type: String },
		profileImage: { type: String },
		gender: { type: String, index: true },
		mobile: { type: String },
		address: { type: String }
	},
});

module.exports.User = mongoose.model('User', UserSchema);
module.exports.ROLES = {
    ADMIN: "admin",
    TEACHER: "teacher",
    PARENT: "parent"
}
