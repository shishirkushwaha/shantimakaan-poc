import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import * as moment from "moment";
import { BsModalRef } from "ngx-bootstrap/modal";
import { TreatmentBooking } from "src/app/models/treatment/treatment-booking.model";
import { TreatmentSevice } from "src/app/services/treatment.service";

@Component({
  selector: 'app-edit-treatment',
  templateUrl: './edit-treatment.component.html',
  styleUrls: ['./edit-treatment.component.scss']
})
export class EditTreatmentComponent {

  public bookingForm: FormGroup | undefined = undefined;

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
      resource: new FormControl(booking.resource),
      treatment: new FormControl(booking.treatment),
      status: new FormControl('BOOKED')
    });

  }

  public update(): void {
    this.treatmentService.updateTreatmentBooking(this.bookingForm?.getRawValue() as TreatmentBooking);
    this.bsModalRef.hide();
  }

}