import { Injectable } from "@angular/core";
import { TreatmentSlotMap, TreatmentSlotMonth, TreatmentSlotStatus } from "../models/treatment/treatment-slot-month.model";
import { BehaviorSubject, Observable, first, forkJoin, map, of } from "rxjs";
import { TreatmentMockService } from "./treatment-mock.service";
import { TreatmentRoom } from "../models/treatment/treatment-room.model";
import { TreatmentBooking } from "../models/treatment/treatment-booking.model";
import * as moment from "moment";

@Injectable()
export class TreatmentSevice {

  private treatmentSlotMonth: BehaviorSubject<TreatmentSlotMonth>;
  private treatmentBookings: BehaviorSubject<TreatmentBooking[]>;

  constructor(private treatmentMock: TreatmentMockService) {
    this.treatmentSlotMonth = new BehaviorSubject(this.treatmentMock.getMonthSlot());
    this.treatmentBookings = new BehaviorSubject<TreatmentBooking[]>(treatmentMock.getBookings());
  }

  public getTreatmentSlotMonth(): Observable<TreatmentSlotMonth> {
    return this.treatmentSlotMonth;
  }

  public getTreatmentRooms(): Observable<TreatmentRoom[]> {
    return of(this.treatmentMock.getRooms());
  }

  public getTreatmentResources(): Observable<string[]> {
    return of(this.treatmentMock.getResources());
  }

  public addTreatmentBooking(booking: TreatmentBooking): void {
    this.treatmentBookings.next([...this.treatmentBookings.value, booking]);
    console.log(this.treatmentBookings.value);
  }

  public updateTreatmentBooking(updatedBooking: TreatmentBooking): void {
    this.treatmentBookings.next([
      ...this.treatmentBookings.value.filter(booking => booking.bookingId !== updatedBooking.bookingId),
      updatedBooking
    ]);
  }

  public deleteTreatmentBooking(bookingId: string): void {
    this.treatmentBookings.next([...this.treatmentBookings.value.filter(booking => booking.bookingId !== bookingId)]);
  }

  public getTreatmentBookings(): Observable<TreatmentBooking[]> {
    return this.treatmentBookings.asObservable();
  }

  private findTreatmentBooking(
    bookings: TreatmentBooking[],
    year: string,
    month: string,
    dayOfMonth: string,
    startTime: string,
    endTime: string,
    roomName: string): TreatmentBooking | undefined {
    const toMoment = (time: string): moment.Moment => moment(time, 'hh:mm A');
    return bookings.find(booking => {
      return booking.year === year
        && booking.month === month
        && booking.dayOfMonth === dayOfMonth
        && toMoment(booking.startTime).isSameOrBefore(toMoment(startTime))
        && toMoment(booking.endTime).isSameOrAfter(toMoment(endTime))
        && booking.roomName === roomName;
    });
  }

  public getTreatmentBookingByTime(
    year: string,
    month: string,
    dayOfMonth: string,
    startTime: string,
    endTime: string,
    roomName: string): Observable<TreatmentBooking | undefined> {
    return this.treatmentBookings.pipe(first(), map(bookings => {
      return this.findTreatmentBooking(bookings, year, month, dayOfMonth, startTime, endTime, roomName);
    }));
  }

  public getTreatmentSlotMap(): Observable<TreatmentSlotMap> {
    return forkJoin([
      this.getTreatmentSlotMonth().pipe(first()),
      this.getTreatmentRooms().pipe(first()),
      this.getTreatmentBookings().pipe(first())
    ]).pipe(map(([slotMonth, rooms, bookings]) => {

      const slotMap: TreatmentSlotMap = {};
      slotMonth.dateSlots.forEach(date => {
        date.timeSlots.forEach(slot => {
          rooms.forEach(room => {
            const booking = this.findTreatmentBooking(bookings, slotMonth.year, slotMonth.month, date.dayOfMonth, slot.startTime, slot.endTime, room.name);
            slotMap[this.slotStatusKey(date.dayOfMonth, slot.startTime, room.name)] = booking ? booking.status : TreatmentSlotStatus.AVAILABLE;
          });
        });
      });

      return slotMap;
    }));
  }

  public slotStatusKey(dayOfMonth: string, startTime: string, roomName: string): string {
    return `${dayOfMonth}-${startTime}-${roomName}`;
  }

  public generateBookingId(): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}