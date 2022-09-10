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
  selector: 'app-companies',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit , AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) pagination: MatPaginator;
  displayedColumns: string[] = ['firstName', 'lastName', 'phoneNumber', 'email', 'dietaryRequirement', 'companyName', 'action'];
  dataSource = new MatTableDataSource();
  base_url:string;
  dtOptions: DataTables.Settings = {};
  data: any;
  delegate: any;
  dietary: any[];
  searchText: string = '';
  results: any;
  searchForm: FormGroup;
  createForm: FormGroup;
  updateForm: FormGroup;
  dtTrigger: Subject<any> = new Subject<any>();
  constructor(private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.base_url = 'https://localhost:44357/api/delegates';
    this.buildForm();
    this.buildCreateForm();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.LoadDelegates();
    this.dietary = [
      { id: 1, name: "Vegetarian," },
      { id: 2, name: "Halal," },
      { id: 3, name: "Vegan" },
      { id: 4, name: "Other" }
    ];
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
    if (this.delegate) {
      this.createForm = this.formBuilder.group({
        firstName: [this.delegate.firstName],
        lastName: [this.delegate.lastName],
        phoneNumber: [this.delegate.phoneNumber],
        email: [this.delegate.email],
        dietaryRequirement: [this.delegate.dietaryRequirement],
        companyName: [this.delegate.phoneNumber],
        delegatePhysicalAddress: [this.delegate.delegatePhysicalAddress],
        delegatePostalAddress: [this.delegate.delegatePostalAddress],
      });
    } else {
      this.createForm = this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        phoneNumber: [''],
        email: [''],
        dietaryRequirement: [''],
        companyName: [''],
        delegatePhysicalAddress: [''],
        delegatePostalAddress: ['']
      });
    }
  }

  onChange(course) {
    this.delegate = course;
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

  createDelegate() {
    if (this.delegate) {
      const updatedUser = {
        'firstName': this.createForm.value.firstName,
        'lastName': this.createForm.value.lastName,
        'phoneNumber': this.createForm.value.phoneNumber,
        'email': this.createForm.value.email,
        'dietaryRequirement': this.createForm.value.dietaryRequirement,
        'companyName': this.createForm.value.companyName,
        'delegatePhysicalAddress': this.createForm.value.delegatePhysicalAddress,
        'delegatePostalAddress': this.createForm.value.delegatePostalAddress
      };
  
      this.http.put(`${this.base_url}/` + this.delegate.delegateID, updatedUser).subscribe((response: Response) => {
        this.LoadDelegates();
        this.resetDelegates();
      });
    } else {
      const course = {
        'delegateID': 0,
        'firstName': this.createForm.value.firstName,
        'lastName': this.createForm.value.lastName,
        'phoneNumber': this.createForm.value.phoneNumber,
        'email': this.createForm.value.email,
        'dietaryRequirement': this.createForm.value.dietaryRequirement,
        'companyName': this.createForm.value.companyName,
        'delegatePhysicalAddress': this.createForm.value.delegatePhysicalAddress,
        'delegatePostalAddress': this.createForm.value.delegatePostalAddress
      };
  
      this.http.post(`${this.base_url}`, course).subscribe((response: Response) => {
        this.LoadDelegates();
        this.resetDelegates();
      });
    }
  }

  deleteDelegate(delegate) {
    this.http.delete(`${this.base_url}/` + delegate.delegateID).subscribe((response: Response) => {
      this.LoadDelegates();
    });
  }

  formatDate(date) {
    const formattedDate: DatePipe = new DatePipe('en-US');
    return formattedDate.transform(date, 'dd/MM/yyyy');
  }

  LoadDelegates() {
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

  resetDelegates() {
    this.createForm.setValue({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        dietaryRequirement: '',
        companyName: '',
        delegatePhysicalAddress: '',
        delegatePostalAddress: ''
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
      title: 'Delegates',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };

    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.results);
  }
}


