import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from 'src/config/supabase/supabase.service';
import { LoginDto } from 'src/types/auth.type';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async validateUser(email: string, password: string) {
    // Buscar usuario por email
    const { data: user, error } = await this.supabaseService.client
      .from('users_profile')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Generar token JWT
    const token = jwt.sign(
      { id: user.identification, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' },
    );

    // Actualizar token en base de datos
    await this.supabaseService.client
      .from('users_profile')
      .update({ token })
      .eq('email', user.email);

    return {
      status: true,
      message: 'Login exitoso',
      data: {
        user: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          identification: user.identification,
          phone: user.phone
        },
        token,
      },
    };
  }

  async logout(userId: number): Promise<{ message: string }> {
    const { error } = await this.supabaseService.client
      .from('users_profile')
      .update({ token: null })
      .eq('identification', userId);

    if (error) {
      throw new UnauthorizedException('Error al cerrar sesión');
    }

    return {
      message: 'Sesión cerrada correctamente',
    };
  }

  async passwordRecovery(email: string): Promise<{ message: string }> {
    const { data, error } = await this.supabaseService.client
      .from('users_profile')
      .select('identification, email')
      .eq('email', email)
      .single();

    if (error || !data) {
      throw new BadRequestException('Correo electrónico no encontrado');
    }

    // Generar código OTP de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Establecer fecha de expiración (5 minutos desde ahora)
    const otpExpired = new Date();
    otpExpired.setMinutes(otpExpired.getMinutes() + 5);

    // Actualizar en la base de datos
    const { error: updateError } = await this.supabaseService.client
      .from('users_profile')
      .update({
        otp: otp,
        otp_expired: otpExpired.toISOString(),
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(
        'Error al generar el código de recuperación',
      );
    }

    // TODO: Aquí se debería implementar el envío del código por correo

    return {
      message: 'Se ha enviado un código de verificación a tu correo',
    };
  }

  async validateOtp(email: string, otp: string): Promise<{ message: string }> {
    const { data: user, error } = await this.supabaseService.client
      .from('users_profile')
      .select('otp, otp_expired')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new BadRequestException('Correo electrónico no encontrado');
    }

    // Verificar si el código ha expirado
    const now = new Date();
    const expiration = new Date(user.otp_expired);

    if (now > expiration) {
      throw new BadRequestException(
        'El código ha expirado, por favor solicite un nuevo código',
      );
    }

    // Verificar si el código coincide
    if (user.otp !== otp) {
      throw new BadRequestException(
        'El código ha expirado o no es válido, por favor ingrese un código valido',
      );
    }

    // Invalidar el código OTP después de usarlo
    const { error: updateError } = await this.supabaseService.client
      .from('users_profile')
      .update({
        otp: null,
        otp_expired: null,
      })
      .eq('email', email);

    if (updateError) {
      throw new BadRequestException('Error al validar el código');
    }

    return {
      message: 'Código válidado correctamente',
    };
  }
}
