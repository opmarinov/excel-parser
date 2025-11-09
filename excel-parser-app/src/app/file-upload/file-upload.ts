import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule
  ]
})
export class FileUpload {
  public searchText: string = '';
  public isDataReady = false;
  public displayedColumns: string[] = [];
  public dataSource: any[] = [];
  public fullSource: any[] = [];
  public excelData: any[] = [];
  private weekDays = ['Monday', 'Tuesday',
    'Wednesday', 'Thursday', 'Friday',
    'Saturday', 'Sunday'];
  public filter = [
    'Name', 'Monday', 'Tuesday',
    'Wednesday', 'Thursday', 'Friday',
    'Saturday', 'Sunday',
    'Date'
  ];
  // public names = [
  //   'Alexandra Sertova',
  //   'Ayshen Halil',
  //   'Denislav Ivanov',
  //   'Fatime Mustafova',
  //   'Ivan Dimitrov',
  //   'Lyubov Dimitrova',
  //   'Martin Kazakov',
  //   'Maruan Saleh',
  //   'Nikolay Angelov',
  //   'Svetoslav Kochanov',
  //   'Valentin Todorov',
  //   'Mariya Vasileva',
  //   'Yordan Angelov',
  //   'Stanislava Dimitrova',
  //   'Esra Yusein'
  // ];
  public names: CheckboxFilter[] = [];
  public dates: CheckboxFilter[] = [];

  public upload(event: any) {
    this.isDataReady = false;

    // reset values
    this.dates = [];
    this.names = [];

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      // console.log('Start parsing...');

      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (data.length === 0) return;

      // Get headers and filter only the allowed ones
      const headers = data[0].map((h: any) => h?.toString().trim() === 'Week Start Date' ? 'Date' : h?.toString().trim());

      this.displayedColumns = headers.filter(h => this.filter.includes(h));

      // console.log('Setting columns... ', this.displayedColumns);

      this.fullSource = data.slice(1).map((row: any[]) => {
        const filteredRow: any = {};
        this.displayedColumns.forEach(col => {
          const index = headers.indexOf(col);

          let cellValue = row[index];

          // ✅ If this column is 'Date', handle conversion
          if (col === 'Date' && cellValue) {
            cellValue = this.parseExcelDate(cellValue) ?? '';

            // can be set
            if (!this.dates.includes(cellValue)) {
              const checkbox: CheckboxFilter = { title: cellValue, checked: true };
              this.dates.push(checkbox);
            }
          }

          // if this is a week day it's a shift i need to parse
          if (this.weekDays.includes(col)) {
            cellValue = this.parseShift(cellValue) ?? '';
          }

          if (col === 'Name') {
            const name = cellValue ?? '';
            const checkbox: CheckboxFilter = { title: name, checked: true };
            this.names.push(checkbox);
          }

          filteredRow[col] = cellValue ?? '';
        });

        return filteredRow;
      });

      this.dataSource = this.fullSource;

      // sort dates
      this.dates.sort();

      this.isDataReady = true;
    };

    reader.readAsBinaryString(file);
  }

  private parseShift(value: string): string {
    if (value === undefined) {
      return '';
    }

    return `${value[0]}${value[1]}:${value[2]}${value[3]}\n${value[5]}${value[6]}:${value[7]}${value[8]}`
  }

  private parseExcelDate(value: any): string {
    // Case 1: If Excel already parsed it as a Date object
    if (value instanceof Date) {
      return value.toISOString().split('T')[0]; // e.g. '2025-11-08'
    }

    // Case 2: If it's a serial number (Excel date number)
    if (typeof value === 'number') {
      // Excel's epoch starts at 1900-01-01
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const result = new Date(excelEpoch.getTime() + value * 86400000);
      return result.toISOString().split('T')[0];
    }

    // Case 3: If it’s already a readable string, just return it
    return value;
  }

  private applyFilters() {
    const nameBoxes = this.names.filter(f => f.checked).map(f => f.title);
    const dateBoxes = this.dates.filter(f => f.checked).map(f => f.title);

    this.dataSource = this.fullSource.filter(f => 
      nameBoxes.includes(f.Name) &&
      dateBoxes.includes(f.Date)
    );
  }

  public filterByDates(checkbox: CheckboxFilter) {
    const checked: boolean = !checkbox.checked;
    checkbox.checked = checked;
    this.applyFilters();
  }

  public filterByName(checkbox: CheckboxFilter) {
    const checked: boolean = !checkbox.checked;
    checkbox.checked = checked;
    this.applyFilters();
  }

  public filterByText() {
    if(this.searchText === undefined || this.searchText === '') {
      return;
    }

    const names = this.searchText.split(', ');

    console.log('names: ', names);

    this.names.forEach(n => {
      if(names.includes(n.title)) {
        n.checked = true;
      }
      else {
        n.checked = false;
      }
    });

    const nameBoxes = this.names.filter(f => f.checked).map(f => f.title);
    const dateBoxes = this.dates.filter(f => f.checked).map(f => f.title);

    this.dataSource = this.fullSource.filter(f => 
      nameBoxes.includes(f.Name) &&
      dateBoxes.includes(f.Date)
    );
  }

  public reset() {
    this.names.forEach(n=> n.checked = true);
    this.dates.forEach(n=> n.checked = true);

    this.applyFilters();
  }

  export() {
    // Create a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource);

    // Create a workbook and append the worksheet
    const workbook: XLSX.WorkBook = { Sheets: { 'Sheet1': worksheet }, SheetNames: ['Sheet1'] };

    // Generate Excel buffer
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save to file
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'schedules.xlsx');
  }
}
