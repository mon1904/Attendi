const XLSX = require('xlsx');

const ROLL = require('../dummy_data/roll.json');

//console.log(ROLL);

let workbook = XLSX.readFile('report_templates/template.xlsm');

let myCell = {v: "42", t: 'n', };

workbook.Sheets.September['C4'] = myCell;

XLSX.writeFile(workbook, 'file.xlsm');

console.log(workbook.Sheets.September);


const STARTING = 4;
const INTERVAL = 10;
const FINAL_COL_ENDING = 24;
const ENDING = 54;

const TOT_COLS = ['C', 'I', 'O', 'U', 'AA'];
const PRES_COLS = ['D', 'J', 'P', 'V', 'AB'];


let sampleRoll = ROLL[0];

let absent = 0;
let total = sampleRoll.roll.length;
for(let roll in sampleRoll.roll) {
    if(roll.status === 'absent') absent++;
}

let rows = 6;
let compCols = 4;
let halfCol = 1;
let classes = 8; // get from sorted rolls?

ROLL.sort(function(a,b){
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.date) - new Date(a.date);
});

var i,j,temparray,chunk = 10;
for (i=0,j=array.length; i<j; i+=chunk) {
    temparray = array.slice(i,i+chunk);
    // do whatever
}
 
function groupBy(arr, property) {
    return arr.reduce(function(memo, x) {
      if (!memo[x[property]]) { memo[x[property]] = []; }
      memo[x[property]].push(x);
      return memo;
    }, {});
  }

let grped = groupBy(ROLL, 'date');
