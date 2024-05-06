import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import * as moment from "moment";
import { BsModalRef } from "ngx-bootstrap/modal";
import { first } from "rxjs";
import { TreatmentBooking } from "src/app/models/treatment/treatment-booking.model";
import { TreatmentSevice } from "src/app/services/treatment.service";

@Component({
  selector: 'app-add-treatment',
  templateUrl: './add-treatment.component.html',
  styleUrls: ['./add-treatment.component.scss']
})
export class AddTreatmentComponent {

  public bookingForm: FormGroup | undefined = undefined;
  public resources: string[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private treatmentService: TreatmentSevice) { }

  public initForm(booking: TreatmentBooking): void {

    this.bookingForm = new FormGroup({
      bookingId: new FormControl(booking.bookingId),
      date: new FormControl({
        value: moment(`${booking.year}-${booking.month}-${booking.dayOfMonth}`).format("dddd, MMMM Do YYYY"),
        disabled: true
      }),
      year: new FormControl(booking.year),
      month: new FormControl(booking.month),
      dayOfMonth: new FormControl(booking.dayOfMonth),
      startTime: new FormControl({ value: booking.startTime, disabled: true }),
      endTime: new FormControl({ value: booking.endTime, disabled: true }),
      roomName: new FormControl({ value: booking.roomName, disabled: true }),
      resource: new FormControl(''),
      treatment: new FormControl(''),
      status: new FormControl('BOOKED')
    });

    this.treatmentService.getTreatmentResources().pipe(first()).subscribe(resources => this.resources = resources);
  }

  public add(): void {
    this.treatmentService.addTreatmentBooking(this.bookingForm?.getRawValue() as TreatmentBooking);
    this.bsModalRef.hide();
  }

}