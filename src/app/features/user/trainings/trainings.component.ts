import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ExportToCsv } from 'export-to-csv';
import { DatePipe } from '@angular/common';

declare var $: any;
@Component({
  selector: 'app-users',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css']
})
export class TrainingsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) pagination: MatPaginator;
  displayedColumns: string[] = ['trainingID', 'trainingName', 'trainingDate', 'trainingVenue', 'noOfSeatLeft', 'trainingCost', 'closingDate', 'action'];
  dataSource = new MatTableDataSource();
  base_url:string;
  dtOptions: DataTables.Settings = {};
  data: any;
  training: any;
  searchText: string = '';
  results: any;
  seletectedDate: any;
  searchForm: FormGroup;
  createForm: FormGroup;
  updateForm: FormGroup;
  dtTrigger: Subject<any> = new Subject<any>();
  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.base_url = 'https://localhost:44357/api/trainings';
    this.buildForm();
    this.buildCreateForm();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.LoadTrainings();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.pagination;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  buildForm() {
    this.searchForm = this.formBuilder.group({
      searchText: [''],
    });
  }

  statusFilter(isTrainingFreeOrPaid) {
    return isTrainingFreeOrPaid ? 'Free' : 'Paid';
  }

  buildCreateForm() {
    if (this.training) {
      this.createForm = this.formBuilder.group({
        trainingName: [this.training.trainingName],
        trainingDate: [this.training.trainingDate],
        trainingVenue: [this.training.trainingVenue],
        noOfSeatLeft: [this.training.noOfSeatLeft],
        trainingCost: [this.training.trainingCost],
        closingDate: [this.training.closingDate]
      });
    } else {
      this.createForm = this.formBuilder.group({
        trainingName: [''],
        trainingDate: [''],
        trainingVenue: [''],
        noOfSeatLeft: [''],
        trainingCost: [''],
        closingDate: ['']
      });
    }
  }

  onChange(course) {
    this.training = course;
    this.buildCreateForm();
  }

  get g() { return this.updateForm.controls; }

  applyFilter(event) {
    if ((this.searchText !== null || this.searchText !== '') && event.length > 0) {
      this.results = this.results.filter(s => s.name.toLowerCase().includes(this.searchText.toLowerCase()));
    } else {
      this.results = this.data.result;
    }
  }

  createTraining() {
    if (this.training) {
      const updatedUser = {
        'trainingName': this.createForm.value.trainingName,
        'trainingDate': this.convertDateToLongString(this.createForm.value.trainingDate),
        'trainingVenue': this.createForm.value.trainingVenue,
        'noOfSeatLeft': this.createForm.value.noOfSeatLeft,
        'trainingCost': this.createForm.value.trainingCost,
        'closingDate': this.convertDateToLongString(this.createForm.value.closingDate)
      };
  
      this.http.put(`${this.base_url}/` + this.training.trainingID, updatedUser).subscribe((response: Response) => {
        this.LoadTrainings();
        this.resetTraining();
      });
    } else {
      const course = {
        'trainingID': 0,
        'trainingName': this.createForm.value.trainingName,
        'trainingDate': this.convertDateToLongString(this.createForm.value.trainingDate),
        'trainingVenue': this.createForm.value.trainingVenue,
        'noOfSeatLeft': this.createForm.value.noOfSeatLeft,
        'trainingCost': this.createForm.value.trainingCost,
        'closingDate': this.convertDateToLongString(this.createForm.value.trainingDate)
      };
  
      this.http.post(`${this.base_url}`, course).subscribe((response: Response) => {
        this.LoadTrainings();
        this.resetTraining();
      });
    }
  }

  deleteTraining(value) {
    this.http.delete(`${this.base_url}/` + value.trainingID).subscribe((response: Response) => {
      this.LoadTrainings();
    });
  }

  formatDate(date) {
    const formattedDate: DatePipe = new DatePipe('en-US');
    return formattedDate.transform(date, 'dd/MM/yyyy');
  }

  convertDateToLongString(date) {
    const formattedDate: DatePipe = new DatePipe('en-US');
    const newDate = formattedDate.transform(date, 'dd/MM/yyyy hh:mm:ss');
    return new Date(newDate.toString().split('GMT')[0]+' UTC').toISOString()
  }

  LoadTrainings() {
    this.http.get(`${this.base_url}`).subscribe((response: Response) => {
      this.data = response;
      this.results = this.data.result;
      this.reacreateMatTableData(this.results);
    });
  }

  reacreateMatTableData(data) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.pagination;
  }

  resetTraining() {
    this.createForm.setValue({
      trainingName: '',
      trainingDate: '',
      trainingVenue: '',
      noOfSeatLeft: '',
      trainingCost: '',
      closingDate: ''
    });
  }

  resetText() {
    this.searchForm.setValue({
      searchText: ''
    });
  }

  search() {
    return this.results.filter(s => s.name.toLowerCase().includes(this.searchText.toLowerCase()))
  }

  setDate(value) {
    if (value) {
      var date = ("0" + value.getDate()).slice(-2);
      var month = ("0" + (value.getMonth() + 1)).slice(-2);
      var year = value.getFullYear();

      this.seletectedDate = date + "/" + month + "/" + year;
    }
  }

  exportToCsv() {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Trainings',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };

    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.results);
  }
}


