var {Attendance} = require('../models/attendance');
var {Student} = require('../models/student');

module.exports.parseRollStatus = (rollStatuses) => {
    let studentRoll = [];
    for(let statusKey in rollStatuses) {
        if(statusKey.includes('status_')) {
            let statusIdSplit = statusKey.split('_');
            studentRoll.push({
                student: statusIdSplit[1],
                status: rollStatuses[statusKey]
            });
        }
    }
    return studentRoll;
};


module.exports.createAttendance = (studentRoll, schoolClassId, callback) => {
    let newAttendance = new Attendance({
        date: Date.now(),
        roll: studentRoll,
        schoolClass: schoolClassId
    });
    newAttendance.save((err) => {
        callback(newAttendance, err);
    });
};

module.exports.studentsToMonitor = (callback) => {
    // Object for maintaining the amount of absences a student has
    let studentAbsenceCount = new Object();
    Attendance.find({"roll.status":"absent"}, (err, attendances) => {
        if(err) throw err;
        for(let i=0; i<attendances.length; i++) {
            let attendance = attendances[i];
            for(let j=0; j<attendance.roll.length; j++) {
                let rollItem = attendance.roll[j];
                if(rollItem.status === "absent") {
                    if(studentAbsenceCount[rollItem.student] !== undefined && studentAbsenceCount[rollItem.student] !== null) {
                        studentAbsenceCount[rollItem.student] = studentAbsenceCount[rollItem.student] + 1;
                    } else {
                        studentAbsenceCount[rollItem.student] = 1;
                    }
                }
            }
        }
        let studentsToMonitor = [];
        for(let key in studentAbsenceCount) {
            // If the student has been absent for 20 or more days, increment that counter
            if(studentAbsenceCount[key] >= 18) {
                studentsToMonitor.push(key);
            }
        }
        Student.find({'_id' : {$in: studentsToMonitor}}, (err, students) => {
            if(err) throw err;
            for(let i=0; i<students.length; i++) {
                students[i].absenceCnt = studentAbsenceCount[students[i]._id];
            }
            callback(students);
        });
    });
}
