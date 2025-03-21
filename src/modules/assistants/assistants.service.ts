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
import { Transaction } from 'src/types/payment.type';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AssistantsService {
  constructor(
    private supabaseService: SupabaseService,
    private emailService: EmailService,
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
    const { assistant, payment } = createRequest;

    try {
      // aqui logica para realizar el pago
      const transaction: Transaction = {
        assistant: assistant,
        payment: payment,
        payment_ref: '1234567890',
        payment_status: 'pending',
        payment_date: '2025-03-17',
        payment_hour: '10:00',
      };

      //Registramos el asistente
      const { data: assistantData, error: assistantError } =
        await this.supabaseService.client
          .from('assistant')
          .insert([assistant])
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
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
