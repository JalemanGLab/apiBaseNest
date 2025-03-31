export interface Login {
  username: string;
  password: string;
}

export interface Pagador {
  Documento: string;
  TipoDocumento: number;
  Nombre_Completo?: string | null;
  Dv?: string | null;
  PRIMERNOMBRE: string;
  SEGUNDONOMBRE: string;
  PRIMERAPELLIDO: string;
  SEGUNDOAPELLIDO: string;
  Telefono: string;
  Email: string;
  Direccion: string;
}

export interface PaymentTransactionRequest {
  IdTramite: number;
  Pagador: Pagador;
  FuentePago: number;
  TipoImplementacion: number;
  Estado_Url: boolean;
  Url?: string | null;
  ValorPagar: number;
  Factura: number;
  referencia: string;
  Descripcion: string;
}

export interface PaymentResult {
  idTransaccion: number;
  url: string;
}

export interface PaymentResponse {
  state: number;
  isSuccess: boolean;
  message: string | null;
  result: PaymentResult;
}
