import { Component, OnDestroy, OnInit } from "@angular/core";
import * as moment from "moment";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Subscription, first, forkJoin } from "rxjs";
import { TreatmentRoom } from "src/app/models/treatment/treatment-room.model";
import { TreatmentSlotMonth, TreatmentSlotMap, TreatmentSlotStatus } from "src/app/models/treatment/treatment-slot-month.model";
import { TreatmentSevice } from "src/app/services/treatment.service";
import { AddTreatmentComponent } from "../add-treatment/add-treatment.component";
import { TreatmentBooking } from "src/app/models/treatment/treatment-booking.model";
import { EditTreatmentComponent } from "../edit-treatment/edit-treatment.component";

@Component({
  selector: 'app-treatment-calendar',
  templateUrl: './treatment-calendar.component.html',
  styleUrls: ['./treatment-calendar.component.scss']
})
export class TreatmentCalendarComponent implements OnInit, OnDestroy {

  public slotMonth?: TreatmentSlotMonth;
  public rooms: TreatmentRoom[] = [];
  public slotStatus: TreatmentSlotMap = {};

  public addBooking?: TreatmentBooking;
  public editBooking?: TreatmentBooking;
  public hoverBooking?: TreatmentBooking;

  private bsModalRef?: BsModalRef;
  private bookingsSubscription?: Subscription;

  constructor(
    private treatmentService: TreatmentSevice,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    forkJoin([
      this.treatmentService.getTreatmentSlotMonth().pipe(first()),
      this.treatmentService.getTreatmentRooms().pipe(first())
    ]).subscribe(([month, rooms]) => {
      this.slotMonth = month;
      this.rooms = rooms;
    });

    this.bookingsSubscription = this.treatmentService.getTreatmentBookings().subscribe(() => {
      this.refreshAllStatus();
      this.addBooking = undefined;
      this.editBooking = undefined;
    });
  }

  public addTreatment(): void {
    const initialState: ModalOptions = {};
    this.bsModalRef = this.modalService.show(AddTreatmentComponent, initialState);
    this.bsModalRef.content.initForm(this.addBooking);
  }

  public editTreatment(): void {
    const initialState: ModalOptions = {};
    this.bsModalRef = this.modalService.show(EditTreatmentComponent, initialState);
    this.bsModalRef.content.initForm(this.editBooking);
  }

  public deleteTreatment(): void {
    if (this.editBooking !== undefined) {
      this.treatmentService.deleteTreatmentBooking(this.editBooking.bookingId);
    }
  }

  public selectSlot(dayOfMonth: string, startTime: string, endTime: string, roomName: string): void {
    if (this.slotMonth === undefined) return;

    const slotStatusKey = this.slotStatusKey(dayOfMonth, startTime, roomName);
    const status = this.slotStatus[slotStatusKey];

    if (status === TreatmentSlotStatus.AVAILABLE) {
      this.disableOtherSlots(dayOfMonth, roomName);
      this.slotStatus[slotStatusKey] = TreatmentSlotStatus.SELECTED;
    }

    if (status === TreatmentSlotStatus.SELECTED) {
      this.slotStatus[slotStatusKey] = TreatmentSlotStatus.AVAILABLE;
      this.enableAllSlots();
    }

    if ([TreatmentSlotStatus.BOOKED, TreatmentSlotStatus.CHECKEDIN].some(s => s === status)) {
      this.refreshAllStatus();
      this.addBooking = undefined;
      this.treatmentService.getTreatmentBookingByTime(
        this.slotMonth?.year,
        this.slotMonth?.month,
        dayOfMonth,
        startTime,
        endTime,
        roomName
      ).pipe(first()).subscribe(booking => {
        this.editBooking = booking;
        this.slotStatus[slotStatusKey] = status === TreatmentSlotStatus.BOOKED ? TreatmentSlotStatus.BOOKEDSELECTED : TreatmentSlotStatus.CHECKEDINSELECTED;
      });
    }

    this.tryUpdateValidSelectedSlot();
  }

  public slotStatusKey(dayOfMonth: string, startTime: string, roomName: string): string {
    return this.treatmentService.slotStatusKey(dayOfMonth, startTime, roomName);
  }

  private disableOtherSlots(selectedDayOfMonth: string, selectedRoomName: string) {
    Object.keys(this.slotStatus).forEach(key => {
      const dayOfMonth = key.split('-')[0];
      const roomName = key.split('-')[2];

      if (this.slotStatus[key] === TreatmentSlotStatus.BOOKEDSELECTED) {
        this.slotStatus[key] = TreatmentSlotStatus.BOOKED;
        this.editBooking = undefined;
      }

      if (this.slotStatus[key] === TreatmentSlotStatus.CHECKEDINSELECTED) {
        this.slotStatus[key] = TreatmentSlotStatus.CHECKEDIN;
        this.editBooking = undefined;
      }

      if (this.slotStatus[key] === TreatmentSlotStatus.AVAILABLE
        && (selectedRoomName !== roomName || selectedDayOfMonth !== dayOfMonth)
      ) {
        this.slotStatus[key] = TreatmentSlotStatus.UNAVAILABLE;
      }
    });
  }

  private enableAllSlots() {
    if (Object.keys(this.slotStatus).every(key => this.slotStatus[key] !== TreatmentSlotStatus.SELECTED)) {
      Object.keys(this.slotStatus).forEach(key => {
        if (this.slotStatus[key] === TreatmentSlotStatus.UNAVAILABLE) {
          this.slotStatus[key] = TreatmentSlotStatus.AVAILABLE;
        }
      });
    }
  }

  private refreshAllStatus() {
    this.treatmentService.getTreatmentSlotMap().pipe(first()).subscribe(slotStatus => {
      this.slotStatus = slotStatus;
      console.log(this.slotStatus);
    });
  }

  private tryUpdateValidSelectedSlot(): void {

    if (this.slotMonth === undefined) return;

    const selectedSlotKeys = Object.keys(this.slotStatus)
      .filter(key => this.slotStatus[key] === TreatmentSlotStatus.SELECTED);

    if (selectedSlotKeys.length <= 0) {
      this.addBooking = undefined; return;
    }

    const momentByKey = (key: string) => moment(key.split('-')[1], 'hh:mm A');

    selectedSlotKeys.sort((a, b) => {
      return momentByKey(a).isBefore(momentByKey(b)) ? -1 : 1;
    });

    for (let index = 0; index < selectedSlotKeys.length; index++) {
      if (index === 0) { continue; }
      if (momentByKey(selectedSlotKeys[index - 1]).add(30, 'minutes')
        .isSame(momentByKey(selectedSlotKeys[index]))) {
        continue;
      }
      this.addBooking = undefined; return;
    }

    this.addBooking = {
      bookingId: this.treatmentService.generateBookingId(),
      year: this.slotMonth?.year,
      month: this.slotMonth?.month,
      dayOfMonth: selectedSlotKeys[0].split('-')[0],
      startTime: momentByKey(selectedSlotKeys[0]).format('hh:mm A'),
      endTime: momentByKey(selectedSlotKeys[selectedSlotKeys.length - 1]).add(30, 'minutes').format('hh:mm A'),
      roomName: selectedSlotKeys[0].split('-')[2],
      resource: '',
      treatment: '',
      status: TreatmentSlotStatus.BOOKED
    }
  }

  ngOnDestroy(): void {
    this.bookingsSubscription?.unsubscribe();
  }

}