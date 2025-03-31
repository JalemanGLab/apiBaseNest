export interface Assistant {
  identification: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  distributor: string;
  distributor_id: number;
  main_procedure: string;
  product_brand: string;
  weekly_procedure: string;
  contact: boolean;
  payment_status: string;
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
  distributor_id: number;
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
}

export interface CreateAssistantResponse {
  status: boolean;
  message: string;
  data?: AssistantResponse[];
  url_redirect: string;
  transaction_id: number;
  error?: any;
}

export interface CreateAssistantRequest {
  assistant: NewAssistant;
}
