var express = require('express');
var router = express.Router();
var { middleware } = require('./util/lib');
var { seed, seedAttendance } = require('../controllers/seeder');
var { Student } = require('../models/student');
var {Attendance} = require('../models/attendance');

/* GET home page. */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// We want to get the attendance statistics for a single student.
router.get('/student/:id', (req, res, next) => {

    Student.findById(req.params.id, (err, student) => {
        if (err) throw err;
        // This list will contain the names of the months. These are used for the labels on the charts.
        // The only months in this list are ones that the student has attendance records for.
        // e.g. If the school year is only in October, there wont be a november, december, jan etc. in this list.
        let months = [];

        // This list contains the total absent count for this student each month. The indexes correspond to the above months[].
        // e.g. months[0] and monthAbsentCnts[0] would be September and 10. This would mean the student was absent 10 days in September
        let monthAbsentCnts = [];

        // Next, we want to show a pie chart of the students attendance over the year.
        // A simple way of doing this is just incrementing one of these 3 counters depending on if the student was late or present.
        let annualAbsentCnt = 0;
        let annualPresentCnt = 0;
        let annualLateCnt = 0;

        console.log(student._id);

        // Here, we want to find all attendance entries in which in the roll, the student has an entry.
        // This essentially is finding all the attendance entries for the class the student is in.
        // The retrieved attendance objects are sorted by date
        Attendance.find({'roll.student': student._id }, null, { sort: { date: 1 } }, (err, attendances) => {
            if (err) throw err;
            // Get month of first attendance taken
            // This is used to maintain the previous month entry when calculating the attendance data.
            let month = attendances[0].date.getMonth();

            // This counter will keep the running total for the current month.
            let monthAbsentCnt = 0;

            // Loop through each attendance
            for (let j = 0; j < attendances.length; j++) {
                let attendance = attendances[j];

                // Get month of current attendance entry
                let cMonth = attendance.date.getMonth();

                // If month of the current attendance object is different from the previous month
                // We know we are at the start
                if (cMonth !== month) {
                    // Push the previous month string to be used as a label.
                    months.push(MONTHS[month]);
                    // Push the corresponding absent count for the month.
                    monthAbsentCnts.push(monthAbsentCnt);

                    // Make the previous month the new month so this can get executed again when there is another new month.
                    month = cMonth;
                    // Reset the month absent count for the new month.
                    monthAbsentCnt = 0
                }

                // In order to increment our counters, we need to loop through the roll call and find the current students entry.
                for (let r = 0; r < attendance.roll.length; r++) {
                    let roll = attendance.roll[r];

                    // If the current roll's student is the student we want. Check its status
                    if (roll.student.equals(student._id)) {
                        switch(roll.status) {
                            // If absent, we want to increment the absent counters.
                            // We dont technically need to count the annualAbsent as it could be calculated. But it thought it might be more clear.
                            case 'absent': {
                                monthAbsentCnt++
                                annualAbsentCnt++;
                                break;
                            }
                            case 'present': {
                                // If present, count the present counter
                                annualPresentCnt++;
                                break;
                            }
                            case 'late': {
                                // If late, count the late counter
                                annualLateCnt++;
                                break;
                            }
                        }
                    }
                } // Loop for rolls ends here.

                // Here, we check if its the last attendance loop.
                // Because we do (cMonth !== month) above, we only save the months statistic information on a new month.
                // But for the last month, it wont get saved with that.
                // So this checks if its the last attendance entry, meaning we are in the last month.
                // If so, we push the month absent data into the lists.
                if(j === attendances.length -1) {
                    months.push(MONTHS[month]);
                    monthAbsentCnts.push(monthAbsentCnt);
                }
            }
            // When all the loops are finished. We have all our stats data. Time to render.
            res.render('graphs/student', {
                monthLabels: months,
                monthAbsentCnts: monthAbsentCnts,
                annualAbsentCnt: annualAbsentCnt,
                annualPresentCnt: annualPresentCnt,
                annualLateCnt: annualLateCnt
            });
        });
    });
});
module.exports = router;
