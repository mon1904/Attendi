// var pdffiller = require('pdffiller');


// var sourcePDF = 'report_templates/template.pdf';
// var destPDF = 'out.pdf';

// pdffiller.generateFDFTemplate(sourcePDF, null, (err, fdfData) => {
//     if(err) throw err;
//     console.log(fdfData);
// })

var hummus = require('hummus');

let dummyData = {
    address1: "Line1,",
    address2: "Line2,",
    address3: "Line3,",
    address4: "Line4.",
    rollNo: "500",
    email: "school@school.com",
    telephone: "131 3133131",
    lostDays: "10",
    totAbsent20: "1",
    expelled: "2",
    susp: "5"
}

let formFields = {
    schoolNameAddress: {
        x: 50,
        y: 680
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

var pdfWriter = hummus.createWriterToModify("report_templates/template.pdf", {modifiedFilePath: 'out.pdf'});
var pageModifier = new hummus.PDFPageModifier(pdfWriter,0)

pageModifier.startContext().getContext().writeText(
    'Nonsense',
    500, 320,
    {font: pdfWriter.getFontForFile('arial.ttf'), size:14,colorspace:'gray',color:0x00}
);


pageModifier.endContext().writePage();
pdfWriter.end();

