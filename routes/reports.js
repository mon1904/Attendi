var express = require('express');
var router = express.Router();
var { Attendance } = require('../models/attendance');
var { SchoolClass } = require('../models/schoolClass');
var { ExcelState } = require('../report_gen/state');
var { Student } = require('../models/student');
var XLSX = require('xlsx');
var hummus = require('hummus');
var fs = require('fs');


const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* GET home page. */

router.get('/', (req, res, next) => {
  // Read excel sheet from disk
  let workbook = XLSX.readFile('report_templates/template.xlsm');

  // Callback to save complete excel sheet
  const downloadWorkbook = function () {
    XLSX.writeFile(workbook, 'gen_reports/file.xlsm');
    var stream = fs.createReadStream('gen_reports/file.xlsm');
    var filename = "leabhar.xlsm";
    // Be careful of special characters

    filename = encodeURIComponent(filename);
    // Ideally this should strip them

    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/blob');

    stream.pipe(res);
  }

  // Find all school classes, sort them by id
  SchoolClass.find({}, null, { sort: { _id: 1 } }, (err, schoolClasses) => {
    // Keep count of total asynchronous jobs until completion
    let totalDone = 0;

    // Call when async process is complete
    const asyncDone = function () {
      totalDone = totalDone + 1;
      // When every school class async job is complete, save/download the sheet.
      if (totalDone === schoolClasses.length) {
        downloadWorkbook();
      }
    }
    /*
    loop through classes
    fetch attendence for each
    sort attendance by date
    check month
    fill out month, checking if its next month
    once next month, next
    */
    for (let i = 0; i < schoolClasses.length; i++) {
      let schoolClass = schoolClasses[i];
      // Get attendance for the current schoolClass, sort by date, this is an async job we wait on above
      Attendance.find({ schoolClass: schoolClass._id }, null, { sort: { date: 1 } }, (err, attendances) => {
        // start handling spreadsheet iteration
        let aState = new ExcelState(i);

        // Get month of first attendance taken
        let month = attendances[0].date.getMonth();

        // Loop through each attendance
        for (let j = 0; j < attendances.length; j++) {
          let attendance = attendances[j];

          // Get month of current attendance entry
          let cMonth = attendance.date.getMonth();
          if (cMonth !== month) {
            // If new month, reset the the iterator to the beginning. Sorted by date so beginning of new month
            aState.resetDays();
            month = cMonth;
          }
          // Get the cell coordinates to write to
          let tCellCo = aState.rollTotalPosition();
          let pCellCo = aState.rollPresentPosition();

          // total roll of students
          let totalRoll = attendance.roll.length;

          // Calculate total present for second column
          let totalPresent = 0;
          for (let r = 0; r < attendance.roll.length; r++) {
            let roll = attendance.roll[r];
            if (roll.status === 'present' || roll.status === 'late') totalPresent++;
          }

          // Get the month string of the current month (Javascript has as an integer, but excel sheet needs the string)
          let monthStr = MONTHS[month];
          workbook.Sheets[monthStr][tCellCo] = { v: totalRoll, t: 'n' };
          workbook.Sheets[monthStr][pCellCo] = { v: totalPresent, t: 'n' };

          // Iterate to the next day
          aState.iterateDay();
        }
        // all attendance has been written to the sheet for the current school class. The job is done
        asyncDone();
      });
    }
  });
});


// Fields on the PDF and their corresponding x and y coordinates.
let formFields = {
  schoolNameAddress1: {
    x: 70,
    y: 670
  },
  schoolNameAddress2: {
    x: 70,
    y: 655
  },
  schoolNameAddress3: {
    x: 70,
    y: 640
  },
  schoolNameAddress4: {
    x: 70,
    y: 625
  },
  schoolNameAddress5: {
    x: 70,
    y: 610
  },
  rollNo: {
    x: 300,
    y: 680
  },
  email: {
    x: 300,
    y: 640
  },
  telephone: {
    x: 300,
    y: 600
  },
  1: {
    x: 500,
    y: 500
  },
  2: {
    x: 500,
    y: 390
  },
  3: {
    x: 500,
    y: 355
  },
  4: {
    x: 500,
    y: 320
  }
}
// https://github.com/galkahana/HummusJS/blob/master/tests/ModifyExistingPageContent.js
router.get('/pdf', (req, res, next) => {
  // Read in the PDF
  var pdfWriter = hummus.createWriterToModify("report_templates/template.pdf", { modifiedFilePath: 'gen_reports/out.pdf' });

  // Get the modifier for the page
  var pageModifier = new hummus.PDFPageModifier(pdfWriter, 0)

  var pageContext = pageModifier.startContext().getContext();

  // TODO: Add address
  let schoolAddress = {
    name: "School Name",
    line1: "School Street",
    line2: "School Area",
    city: "School City",
    county: "School County"
  };

  // TODO: Get this information from somewhere else?
  let email = "school@school.com";
  let telephone = "000 000 0000";

  let rollNo = 0; //total no of students?
  let totalAbsence = 0;
  let studentAbsence20 = 0;

  // TODO: Add expelled / suspended to students?
  let totalExpelled = 0;
  let totalSuspended = 0;

  // Find all attendance where  students are absent
  Attendance.find({ "roll.status": "absent" }, (err, attendances) => {
    if (err) throw err;
    // Find all students
    Student.find({}, (err, students) => {
      if (err) throw err;

      // Roll no on form is total amount of students
      rollNo = students.length;

      // Object for maintaining the amount of absences a student has
      let studentAbsenceCount = new Object();

      for (let i = 0; i < attendances.length; i++) {

        let attendance = attendances[i];


        // Count up how many times each student has been absent
        for (let j = 0; j < attendance.roll.length; j++) {
          let rollItem = attendance.roll[j];
          let rollStudentId = rollItem.student.toString();
          if(rollItem.status === "absent") {
            // This counts up the total amount of days lost to absence
            totalAbsence++;
            if (studentAbsenceCount[rollStudentId] !== undefined && studentAbsenceCount[rollStudentId] !== null) {
              studentAbsenceCount[rollStudentId] = studentAbsenceCount[rollStudentId] + 1;
            } else {
              studentAbsenceCount[rollStudentId] = 1;
            }
          }

        }
      }

      // Loops through each student absence count
      for (let key in studentAbsenceCount) {
        // If the student has been absent for 20 or more days, increment that counter
        if (studentAbsenceCount[key] >= 20) {
          studentAbsence20++;
        }
      }
      let myFont = pdfWriter.getFontForFile('arial.ttf');

      // Write out all the data into the PDF

      pageContext.writeText(
        schoolAddress.name,
        formFields.schoolNameAddress1.x, formFields.schoolNameAddress1.y,
        { font: myFont, size: 14, colorspace: 'gray', color: 0x00 }
      );
      pageContext.writeText(
        schoolAddress.line1,
        formFields.schoolNameAddress2.x, formFields.schoolNameAddress2.y,
        { font: myFont, size: 14, colorspace: 'gray', color: 0x00 }
      );
      pageContext.writeText(
        schoolAddress.line2,
        formFields.schoolNameAddress3.x, formFields.schoolNameAddress3.y,
        { font: myFont, size: 14, colorspace: 'gray', color: 0x00 }
      );
      pageContext.writeText(
        schoolAddress.city,
        formFields.schoolNameAddress4.x, formFields.schoolNameAddress4.y,
        { font: myFont, size: 14, colorspace: 'gray', color: 0x00 }
      );
      pageContext.writeText(
        schoolAddress.county,
        formFields.schoolNameAddress5.x, formFields.schoolNameAddress5.y,
        { font: myFont, size: 14, colorspace: 'gray', color: 0x00 }
      );


      pageContext.writeText(
        email,
        formFields.email.x, formFields.email.y,
        { font: myFont, size: 14, colorspace: 'gray', color: 0x00 }
      );

      pageContext.writeText(
        '' + telephone,
        formFields.telephone.x, formFields.telephone.y,
        { font: pdfWriter.getFontForFile('arial.ttf'), size: 14, colorspace: 'gray', color: 0x00 }
      );

      pageContext.writeText(
        '' + rollNo,
        formFields.rollNo.x, formFields.rollNo.y,
        { font: pdfWriter.getFontForFile('arial.ttf'), size: 14, colorspace: 'gray', color: 0x00 }
      );

      pageContext.writeText(
        '' + totalAbsence,
        formFields[1].x, formFields[1].y,
        { font: pdfWriter.getFontForFile('arial.ttf'), size: 14, colorspace: 'gray', color: 0x00 }
      );

      pageContext.writeText(
        '' + studentAbsence20,
        formFields[2].x, formFields[2].y,
        { font: pdfWriter.getFontForFile('arial.ttf'), size: 14, colorspace: 'gray', color: 0x00 }
      );

      pageContext.writeText(
        '' + totalExpelled,
        formFields[3].x, formFields[3].y,
        { font: pdfWriter.getFontForFile('arial.ttf'), size: 14, colorspace: 'gray', color: 0x00 }
      );

      pageContext.writeText(
        '' + totalSuspended,
        formFields[4].x, formFields[4].y,
        { font: pdfWriter.getFontForFile('arial.ttf'), size: 14, colorspace: 'gray', color: 0x00 }
      );

      // Write the page and close / save the file.
      console.log("Writing the page");
      pageModifier.endContext().writePage();
      console.log("Closing / Saving file");
      pdfWriter.end();
      var stream = fs.createReadStream('gen_reports/out.pdf');
      var filename = "tusla.pdf";
      // Be careful of special characters

      filename = encodeURIComponent(filename);
      // Ideally this should strip them

      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');

      stream.pipe(res);
    });
  });
});

module.exports = router;
