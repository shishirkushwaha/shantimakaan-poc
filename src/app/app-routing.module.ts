import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TreatmentCalendarComponent } from './components/treatment/treatment-calendar/treatment-calendar.component';

const routes: Routes = [
  {
    path: '**',
    component: TreatmentCalendarComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
