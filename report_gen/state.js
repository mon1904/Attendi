
// Correspond to columns and rows in the excel sheet
const TOT_COLS = ['C', 'I', 'O', 'U', 'AA'];
const PRES_COLS = ['D', 'J', 'P', 'V', 'AB'];
const BASE_ROWS = [4, 14, 24, 34, 44, 54];

// Manages iterating through the excel spreadsheet
class ExcelState {
  constructor(rowOffset) {
    this.col_index = 0;
    this.row_index = 0;
    this.row_offset = rowOffset;
    this.resetDays = this.resetDays.bind(this);
    this.rollTotalPosition = this.rollTotalPosition.bind(this);
    this.rollPresentPosition = this.rollPresentPosition.bind(this);
    this.iterateDay = this.iterateDay.bind(this);
  }

// Set back to initial day on the spreadsheet
  resetDays() {
    this.col_index = 0;
    this.row_index = 0;
  }

 // This gets the position where the total number of students gets inputted
  rollTotalPosition() {
    return TOT_COLS[this.col_index] + (BASE_ROWS[this.row_index] + this.row_offset);
  }

 // This gets the position where the total number of present students gets inputted
  rollPresentPosition() {
    return PRES_COLS[this.col_index] + (BASE_ROWS[this.row_index] + this.row_offset);
  }

 // Iterates columns and rows to the next day on the spreadsheet
  iterateDay() {
    this.row_index = this.row_index + 1;
    if(this.row_index === BASE_ROWS.length) {
      this.row_index = 0;
      this.col_index = this.col_index + 1;
    }
  }
}

module.exports.ExcelState = ExcelState;
