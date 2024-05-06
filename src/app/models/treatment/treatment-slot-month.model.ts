export interface TreatmentSlotMonth {
  month: string;
  year: string;
  dateSlots: TreatmentSlotDate[];
}

export interface TreatmentSlotDate {
  dayOfWeek: string;
  dayOfMonth: string;
  timeSlots: TreatmentSlotTime[];
}

export interface TreatmentSlotTime {
  startTime: string;
  endTime: string;
  status: TreatmentSlotStatus;
}

export enum TreatmentSlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  CHECKEDIN = "CHECKEDIN",
  SELECTED = "SELECTED",
  BOOKEDSELECTED = "BOOKEDSELECTED",
  CHECKEDINSELECTED = "CHECKEDINSELECTED",
  UNAVAILABLE = "UNAVAILABLE"
}

export interface TreatmentSlotMap {
  [key: string]: TreatmentSlotStatus;
}

export interface TreatmentSlot {
  year: string;
  month: string;
  dayOfMonth: string;
  startTime: string;
  endTime: string;
  roomName: string;
}