import { Injectable } from "@angular/core";
import * as moment from "moment";
import {
  TreatmentSlotDate,
  TreatmentSlotMonth,
  TreatmentSlotStatus,
  TreatmentSlotTime
} from "../models/treatment/treatment-slot-month.model";
import { TreatmentRoom } from "../models/treatment/treatment-room.model";
import { TreatmentBooking } from "../models/treatment/treatment-booking.model";

@Injectable()
export class TreatmentMockService {

  public getMonthSlot(): TreatmentSlotMonth {
    return {
      month: moment().format('MMMM'),
      year: moment().format('YYYY'),
      dateSlots: this.getSlotDates()
    };
  }

  private getSlotDates(): TreatmentSlotDate[] {
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    const result: TreatmentSlotDate[] = [];

    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      result.push({
        dayOfMonth: moment(new Date(year, month, day)).format('DD'),
        dayOfWeek: moment(new Date(year, month, day)).format('dddd'),
        timeSlots: this.getSlotTimes()
      })
    }

    return result;
  }

  private getSlotTimes(): TreatmentSlotTime[] {
    const result: TreatmentSlotTime[] = [];
    for (let i = 8; i < 16; i++) {
      for (let j = 0; j < 60; j += 30) {
        const startMoment = moment(new Date(2021, 1, 1, i, j));
        const endMoment = moment(startMoment).add(30, 'minutes');
        result.push({
          startTime: startMoment.format('hh:mm A'),
          endTime: endMoment.format('hh:mm A'),
          status: TreatmentSlotStatus.AVAILABLE
        })
      }
    }
    return result;
  }

  public getRooms(): TreatmentRoom[] {
    return ["OT TEST", "OT1", "OT2", "OT3", "OT4", "OT5", "Consultation"].map(name => ({ name }));
  }

  public getResources(): string[] {
    return ["Sandeep Shukla", "Ancy Crasta", "Mohan Ramaswamy", "Golu Kumal", "Piyush Bharadwaj"];
  }

  public getBookings(): TreatmentBooking[] {
    const monthSlot = this.getMonthSlot();
    const rooms = this.getRooms();
    const resources = this.getResources();
    return [1, 2].map(i => {
      return {
        bookingId: "ABCDEFGHIJKL" + i,
        year: monthSlot.year,
        month: monthSlot.month,
        dayOfMonth: monthSlot.dateSlots[i - 1].dayOfMonth,
        startTime: monthSlot.dateSlots[i - 1].timeSlots[i * 3].startTime,
        endTime: monthSlot.dateSlots[i - 1].timeSlots[(i * 3) + i].endTime,
        roomName: rooms[i].name,
        resource: resources[i],
        treatment: "Treatment " + i,
        status: TreatmentSlotStatus.BOOKED
      };
    });
  }

}