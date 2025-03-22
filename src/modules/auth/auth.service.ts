import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from 'src/config/supabase/supabase.service';
import { LoginDto } from 'src/types/auth.type';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
	constructor(private supabaseService: SupabaseService) { }

	async login(loginDto: LoginDto) {
		// Buscar usuario por email
		const { data: user, error } = await this.supabaseService.client
			.from('users_profile')
			.select('*')
			.eq('email', loginDto.email)
			.single();

		if (error || !user) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		// Verificar contraseña
		const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Credenciales inválidas');
		}

		// Generar token JWT
		const token = jwt.sign(
			{ id: user.identification, role: user.role },
			process.env.JWT_SECRET as string,
			{ expiresIn: '24h' }
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
					role: user.role
				},
				token
			}
		};
	}
}