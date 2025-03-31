import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from 'src/config/supabase/supabase.service';
import { EmailService } from 'src/config/email/email.service';
import {
  Assistant,
  CreateAssistantRequest,
  CreateAssistantResponse,
} from 'src/types/assistants.type';
import { PaymentTransactionRequest } from 'src/types/payment.type';
import * as bcrypt from 'bcrypt';
import { PaymentsService } from '../payments/payments.service';
@Injectable()
export class AssistantsService {
  constructor(
    private supabaseService: SupabaseService,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
  ) {}

  async findAll() {
    const { data, error, count, status, statusText } =
      await this.supabaseService.client
        .from('assistant')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    const response = {
      status: status,
      message: 'Asistentes encontrados correctamente',
      data: data,
      count: count,
      statusText: statusText,
      error: error,
    };
    return response;
  }

  async findOne(identification: number): Promise<Assistant> {
    const { data, error } = await this.supabaseService.client
      .from('assistant')
      .select('*')
      .eq('identification', identification)
      .single();

    if (!data) {
      throw new NotFoundException(
        `Asistente con identificación ${identification} no encontrado`,
      );
    }

    if (error) throw error;
    return data;
  }

  async registerEntry(identification: number) {
    const { data: assistant, error: findError } =
      await this.supabaseService.client
        .from('assistant')
        .select('entry')
        .eq('identification', identification)
        .single();

    if (!assistant) {
      throw new NotFoundException(
        `Asistente con identificación ${identification} no encontrado`,
      );
    }

    if (findError) throw new ConflictException(findError);

    if (assistant.entry) {
      throw new ConflictException('El asistente ya registró su entrada');
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour12: false });

    const { data, error } = await this.supabaseService.client
      .from('assistant')
      .update({
        entry: true,
        entry_datetime: formattedTime,
      })
      .eq('identification', identification)
      .select()
      .single();

    if (error) throw new ConflictException(error);

    return {
      status: true,
      message: 'Entrada registrada correctamente',
      data: [data],
    };
  }

  async create(
    createRequest: CreateAssistantRequest,
  ): Promise<CreateAssistantResponse> {
    const { assistant } = createRequest;
    const factura = await this.paymentsService.getNextInvoiceNumber();
    const referencia = await this.paymentsService.generateReference(
      assistant.identification,
    );

    try {
      const transaction: PaymentTransactionRequest = {
        IdTramite: assistant.distributor_id,
        Pagador: {
          Documento: assistant.identification.toString(),
          TipoDocumento: 1,
          Nombre_Completo: null,
          Dv: null,
          PRIMERNOMBRE: assistant.first_name,
          SEGUNDONOMBRE: '',
          PRIMERAPELLIDO: assistant.last_name,
          SEGUNDOAPELLIDO: '',
          Telefono: assistant.phone,
          Email: assistant.email,
          Direccion: assistant.city,
        },
        FuentePago: 1,
        TipoImplementacion: 1,
        Estado_Url: false,
        Url: null,
        ValorPagar: 500000,
        Factura: factura,
        referencia: referencia,
        Descripcion: 'Pago Congreso Magno 3.0',
      };

      const transactionResponse =
        await this.paymentsService.createTransaction(transaction);

      // Agregamos los datos de pago al asistente
      const assistantWithPayment = {
        ...assistant,
        payment_status: 'Pendiente',
        payment_ref: referencia,
        transaction_id: transactionResponse.result.idTransaccion,
      };

      const { data: assistantData, error: assistantError } =
        await this.supabaseService.client
          .from('assistant')
          .insert([assistantWithPayment])
          .select()
          .single();
      if (assistantError) {
        if (assistantError.code === '23505') {
          if (assistantError.message.includes('phone')) {
            throw new ConflictException(
              'El número de teléfono ya está registrado',
            );
          } else if (assistantError.message.includes('email')) {
            throw new ConflictException(
              'El correo electrónico ya está registrado',
            );
          } else if (
            assistantError.message.includes('identification') ||
            assistantError.details?.includes('identification')
          ) {
            throw new ConflictException(
              'El número de identificación ya está registrado',
            );
          }
        }
        throw new ConflictException(assistantError);
      } else {
        //registro en la tabla de users_profile
        const hashedPassword = await bcrypt.hash(
          assistant.identification.toString(),
          10,
        );
        const user_profile = {
          identification: assistant.identification,
          first_name: assistant.first_name,
          last_name: assistant.last_name,
          phone: assistant.phone,
          email: assistant.email,
          role: 'assistant',
          password: hashedPassword,
        };
        const { error: userError } = await this.supabaseService.client
          .from('users_profile')
          .insert([user_profile])
          .select()
          .single();
        if (userError) {
          await this.supabaseService.client
            .from('assistant')
            .delete()
            .eq('identification', assistant.identification);
          throw new ConflictException(userError);
        }
      }

      // enviar correo
      // try {
      // 	const emailResponse = await this.emailService.sendEmail();
      // 	console.log(emailResponse);
      // } catch (error) {
      // 	console.log(error);
      // }

      return {
        status: true,
        message: 'Asistente registrado correctamente',
        data: [
          {
            identification: assistant.identification,
            first_name: assistant.first_name,
            last_name: assistant.last_name,
            phone: assistant.phone,
            email: assistant.email,
            city: assistant.city,
          },
        ],
        url_redirect: transactionResponse.result.url,
        transaction_id: transactionResponse.result.idTransaccion,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
