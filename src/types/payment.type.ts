import { NewAssistant } from "./assistants.type";

export interface Card {
  name: string;
  number: string;
  expiration_date: string;
  cvv: string;
}

export interface PSE {
  bank: string;
  type_person: 'natural' | 'juridica';
}

export interface Payment {
  type: 'PSE';
  value: number;
  pse?: PSE;
  card?: Card;
}

export interface Transaction {
  assistant: NewAssistant;
  payment: Payment;
  payment_ref: string;
  payment_status: string;
  payment_date: string;
  payment_hour: string;
}