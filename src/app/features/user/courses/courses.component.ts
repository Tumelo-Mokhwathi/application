import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ExportToCsv } from 'export-to-csv';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-companies',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit , AfterViewInit {
  base_url:string;
  dtOptions: DataTables.Settings = {};
  data: any;
  course: any;
  searchText: string = '';
  results: any;
  searchForm: FormGroup;
  createForm: FormGroup;
  updateForm: FormGroup;
  dtTrigger: Subject<any> = new Subject<any>();
  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }
  
  ngOnInit() {
    this.base_url = 'https://localhost:44357/api/courses';
    this.buildForm();
    this.buildCreateForm();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.LoadCourses();
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
    if (this.course) {
      this.createForm = this.formBuilder.group({
        courseCode: [this.course.courseCode],
        courseDescription: [this.course.courseDescription],
        courseName: [this.course.courseName],
        trainingVenueSelected: [this.course.trainingVenueSelected],
        isTrainingFreeOrPaid: [this.course.isTrainingFreeOrPaid]
      });
    } else {
      this.createForm = this.formBuilder.group({
        courseCode: [''],
        courseDescription: [''],
        courseName: [''],
        trainingVenueSelected: [''],
        isTrainingFreeOrPaid: [false]
      });
    }
  }

  onChange(course) {
    this.course = course;
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

  createCourse() {
    if (this.course) {
      const updatedUser = {
        'courseName': this.createForm.value.courseName,
        'courseDescription': this.createForm.value.courseDescription,
        'courseCode': this.createForm.value.courseCode,
        'trainingVenueSelected': this.createForm.value.trainingVenueSelected,
        'isTrainingFreeOrPaid': this.createForm.value.isTrainingFreeOrPaid
      };
  
      this.http.put(`${this.base_url}/` + this.course.courseID, updatedUser).subscribe((response: Response) => {
        this.LoadCourses();
        this.resetCreateCourse();
      });
    } else {
      const course = {
        'courseID': 0,
        'courseName': this.createForm.value.courseName,
        'courseDescription': this.createForm.value.courseDescription,
        'courseCode': this.createForm.value.courseCode,
        'trainingVenueSelected': this.createForm.value.trainingVenueSelected,
        'isTrainingFreeOrPaid': this.createForm.value.isTrainingFreeOrPaid
      };
  
      this.http.post(`${this.base_url}`, course).subscribe((response: Response) => {
        this.LoadCourses();
        this.resetCreateCourse();
      });
    }
  }

  deleteCourse(course) {
    this.http.delete(`${this.base_url}/` + course.courseID).subscribe((response: Response) => {
      this.LoadCourses();
    });
  }

  formatDate(date) {
    const formattedDate: DatePipe = new DatePipe('en-US');
    return formattedDate.transform(date, 'dd/MM/yyyy');
  }

  LoadCourses() {
    this.http.get(`${this.base_url}`).subscribe((response: Response) => {
      this.data = response;
      this.results = this.data.result;
    });
  }

  resetCreateCourse() {
    this.createForm.setValue({
      courseName: '',
      courseDescription: '',
      courseCode: '',
      trainingVenueSelected: '',
      isTrainingFreeOrPaid: ''
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
      title: 'Courses',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };

    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.results);
  }
}


