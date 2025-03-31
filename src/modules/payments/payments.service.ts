import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/config/supabase/supabase.service';
import axios from 'axios';
import { PaymentTransactionRequest } from 'src/types/payment.type';

@Injectable()
export class PaymentsService {
  private token: string | null = null;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  private async login() {
    try {
      const username = this.configService.get<string>('PAYMENT_USERNAME');
      const password = this.configService.get<string>('PAYMENT_PASSWORD');
      const paymentUrl = this.configService.get<string>('PAYMENT_URL');

      if (!username || !password || !paymentUrl) {
        throw new UnauthorizedException(
          'Credenciales de pago no configuradas correctamente',
        );
      }

      const response = await axios.post(`${paymentUrl}/login/auth`, {
        username,
        password,
      });

      if (!response.data?.result) {
        throw new UnauthorizedException(
          'Token no recibido del servicio de pagos',
        );
      }

      this.token = response.data.result;
      return this.token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new UnauthorizedException(
          `Error al autenticar: ${error.response?.data?.message || error.message}`,
        );
      }
      throw new UnauthorizedException(
        'Error al autenticar con el servicio de pagos',
      );
    }
  }

  async getNextInvoiceNumber(): Promise<number> {
    const { count, error } = await this.supabaseService.client
      .from('assistant')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return 1;
    }

    return (count || 0) + 1;
  }

  async generateReference(identification: number): Promise<string> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    return `${identification}${invoiceNumber.toString()}`;
  }

  async findTransaction(transactionId: number) {
    if (!this.token) {
      await this.login();
    }

    try {
      const response = await axios.get(
        `${this.configService.get('PAYMENT_URL')}/transaction/GetTransactionInformationIDTransaction?IDTransaction=${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      const paymentStatus = response.data.result.estado_Descripcion;

      try {
        const { error } = await this.supabaseService.client
          .from('assistant')
          .update({
            payment_status: paymentStatus,
            payment_update: new Date()
              .toISOString()
              .replace('T', ' ')
              .split('.')[0],
          })
          .eq('transaction_id', transactionId);

        if (error) {
          return {
            status: false,
            message: 'Error al actualizar el estado del pago',
            error: error.message,
            data: response.data,
          };
        }

        return {
          status: true,
          message: 'Estado de pago actualizado correctamente',
          data: response.data,
        };
      } catch (dbError) {
        return {
          status: false,
          message: 'Error en la base de datos',
          error: dbError.message,
          data: response.data,
        };
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await this.login();
        return this.findTransaction(transactionId);
      }
      if (error.response?.status === 404) {
        return {
          status: false,
          message: 'Transacción no encontrada',
          error: 'NOT_FOUND',
          statusCode: 404,
        };
      }
      return {
        status: false,
        message: 'Error al consultar la transacción',
        error: error.message,
        statusCode: error.response?.status || 500,
      };
    }
  }

  async createTransaction(paymentRequest: PaymentTransactionRequest) {
    if (!this.token) {
      await this.login();
    }

    try {
      const response = await axios.post(
        `${this.configService.get('PAYMENT_URL')}/transaction/insertTransaction`,
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Si el token expiró, intentamos login de nuevo
        await this.login();
        return this.createTransaction(paymentRequest);
      }
      throw new UnauthorizedException(
        'Error al crear la transacción: ' + error.message,
      );
    }
  }
}
