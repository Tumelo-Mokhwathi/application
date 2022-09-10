import { NgModule } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TrainingsComponent } from './trainings/trainings.component';
import { CoursesComponent } from './courses/courses.component';
import { RegistrationComponent } from './registration/registration.component';
import { MatNativeDateModule, } from '@angular/material/core';

export const routes = [
    { path: '', pathMatch: 'full', redirectTo: 'account-info' },
    { path: 'trainings', component: TrainingsComponent },
    { path: 'courses', component: CoursesComponent },
    { path: 'registration', component: RegistrationComponent }
];


@NgModule({
    declarations: [
        TrainingsComponent,
        CoursesComponent,
        RegistrationComponent
    ],
  imports: [
      CommonModule,
      DataTablesModule,
      FlexLayoutModule,
      MatIconModule,
      MatInputModule,
      MatButtonModule,
      MatTableModule,
      ReactiveFormsModule,
      FormsModule,
      MatPaginatorModule,
      MatDatepickerModule,
      MatNativeDateModule,
      RouterModule.forChild(routes)
  ]
})
export class UserModule { }
