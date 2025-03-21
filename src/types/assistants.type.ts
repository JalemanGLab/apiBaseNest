import { Payment } from "src/types/payment.type";
export interface Assistant {
  identification: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  distributor: string;
  main_procedure: string;
  product_brand: string;
  weekly_procedure: string;
  contact: boolean;
  payment: string;
  payment_update: string;
  payment_ref: string;
  entry: boolean;
  entry_datetime: string;
  created_at: string;
}
export class NewAssistant {
  identification: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  distributor: string;
  main_procedure: string;
  product_brand: string;
  weekly_procedure: string;
  contact: boolean;
}

export interface AssistantResponse {

  identification: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
};







export interface CreateAssistantResponse {
  status: boolean;
  message: string;
  data?: AssistantResponse[];
  error?: any;
}

export interface CreateAssistantRequest {
  assistant: NewAssistant;
  payment: Payment;
}

