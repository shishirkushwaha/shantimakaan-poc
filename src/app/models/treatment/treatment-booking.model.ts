import { TreatmentSlotStatus } from "./treatment-slot-month.model";

export interface TreatmentBooking {

  bookingId: string;
  year: string;
  month: string;
  dayOfMonth: string;
  startTime: string;
  endTime: string;
  roomName: string;
  resource: string;
  treatment: string;
  status: TreatmentSlotStatus;

}