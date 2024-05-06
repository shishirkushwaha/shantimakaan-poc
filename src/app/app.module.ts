import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';

import { TreatmentMockService } from './services/treatment-mock.service';
import { TreatmentSevice } from './services/treatment.service';
import { TreatmentCalendarComponent } from './components/treatment/treatment-calendar/treatment-calendar.component';
import { AddTreatmentComponent } from './components/treatment/add-treatment/add-treatment.component';
import { EditTreatmentComponent } from './components/treatment/edit-treatment/edit-treatment.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TreatmentCalendarComponent,
    AddTreatmentComponent,
    EditTreatmentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    TypeaheadModule.forRoot()
  ],
  providers: [
    TreatmentMockService,
    TreatmentSevice
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
