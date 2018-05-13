const {User, ROLES} = require('../models/user');
const bcrypt = require('bcryptjs');

const hashPassword = (password, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            callback(err, hash);
        });
    });
};

module.exports.hashPassword = hashPassword;


module.exports.createUser = (newUser, callback) => {
    hashPassword(newUser.password, (err, hash) => {
        newUser.password = hash;
        newUser.save(callback);
    });
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        callback(null, isMatch);
    });
}

module.exports.findTeacherById = (id, callback) => {
    User.findOne({_id: id, role: ROLES.TEACHER}, (err, teacher) => {
        callback(err, teacher);
    });
}

module.exports.findParentById = (id, callback) => {
    User.findOne({_id: id, role: ROLES.PARENT}, (err, parent) => {
        callback(err, parent);
    });
}

module.exports.findTeachers = (callback) => {
    User.find({role: ROLES.TEACHER}, callback);
}

module.exports.findParents = (callback) => {
    User.find({role: ROLES.PARENT}, callback);
};

module.exports.requestBodyToModel = (reqBody) => {
    return {
        details: {
          firstname: reqBody.firstname,
          lastname: reqBody.lastname,
          gender: reqBody.gender,
          address: reqBody.address,
          mobile: reqBody.mobile
        },
        username: reqBody.username,
        password: reqBody.password,
        role: reqBody.role,
        email: reqBody.email
      };
}

module.exports.getUserByUsername = (username, callback) => {
    User.findOne({username: username}, callback);
}

