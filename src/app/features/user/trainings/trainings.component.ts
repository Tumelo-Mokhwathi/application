import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ExportToCsv } from 'export-to-csv';
import { DatePipe } from '@angular/common';

declare var jQuery: any;
@Component({
  selector: 'app-users',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css']
})
export class TrainingsComponent implements OnInit, AfterViewInit {
  base_url:string;
  dtOptions: DataTables.Settings = {};
  data: any;
  training: any;
  searchText: string = '';
  results: any;
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
        'trainingDate': this.createForm.value.trainingDate,
        'trainingVenue': this.createForm.value.trainingVenue,
        'noOfSeatLeft': this.createForm.value.noOfSeatLeft,
        'trainingCost': this.createForm.value.trainingCost,
        'closingDate': this.createForm.value.closingDate
      };
  
      this.http.put(`${this.base_url}/` + this.training.trainingID, updatedUser).subscribe((response: Response) => {
        this.LoadTrainings();
        this.resetTraining();
      });
    } else {
      const course = {
        'trainingID': 0,
        'trainingName': this.createForm.value.trainingName,
        'trainingDate': this.createForm.value.trainingDate,
        'trainingVenue': this.createForm.value.trainingVenue,
        'noOfSeatLeft': this.createForm.value.noOfSeatLeft,
        'trainingCost': this.createForm.value.trainingCost,
        'closingDate': this.createForm.value.closingDate
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

  LoadTrainings() {
    this.http.get(`${this.base_url}`).subscribe((response: Response) => {
      this.data = response;
      this.results = this.data.result;
    });
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


