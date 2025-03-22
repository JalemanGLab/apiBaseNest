import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  User,
  CreateUserRequest,
  CreateUserResponse,
} from 'src/types/user.type';
import { SupabaseService } from 'src/config/supabase/supabase.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error, count, status, statusText } =
      await this.supabaseService.client
        .from('users_profile')
        .select(
          'identification, first_name, last_name, phone, email, role, token, is_active, created_at',
        )
        .order('created_at', { ascending: false });

    if (error) throw error;
    const response = {
      status: status,
      message: 'Usuarios encontrados correctamente',
      data: data,
      count: count,
      statusText: statusText,
      error: error,
    };
    return response;
  }

  async findOne(identification: number): Promise<Omit<User, 'password'>> {
    const { data, error } = await this.supabaseService.client
      .from('users_profile')
      .select(
        'identification, first_name, last_name, phone, email, role, token, is_active, created_at',
      )
      .eq('identification', identification)
      .single();

    if (!data) {
      throw new NotFoundException(
        `Usuario con identificación ${identification} no encontrado`,
      );
    }

    if (error) throw error;
    return data;
  }

  async create(createRequest: CreateUserRequest): Promise<CreateUserResponse> {
    const { user } = createRequest;

    try {
      const hashedPassword = await bcrypt.hash(
        user.identification.toString(),
        10,
      );

      const user_profile = {
        identification: user.identification,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
        role: 'admin',
        password: hashedPassword,
        is_active: true,
      };

      const { data: userData, error: userProfileError } =
        await this.supabaseService.client
          .from('users_profile')
          .insert([user_profile])
          .select()
          .single();

      if (userProfileError) {
        if (userProfileError.code === '23505') {
          if (userProfileError.message.includes('phone')) {
            throw new ConflictException(
              'El número de teléfono ya está registrado',
            );
          } else if (userProfileError.message.includes('email')) {
            throw new ConflictException(
              'El correo electrónico ya está registrado',
            );
          } else if (
            userProfileError.message.includes('identification') ||
            userProfileError.details?.includes('identification')
          ) {
            throw new ConflictException(
              'El número de identificación ya está registrado',
            );
          }
        }
        throw new ConflictException(userProfileError);
      }

      return {
        status: true,
        message: 'Usuario registrado correctamente',
        data: [
          {
            identification: userData.identification,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            email: userData.email,
            role: userData.role,
            is_active: userData.is_active,
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

  async updateUserRole(
    identification: number,
    updateRole: string,
    user: User,
  ): Promise<CreateUserResponse> {
    const userToUpdate = await this.findOne(identification);

    if (!userToUpdate) {
      throw new NotFoundException(
        `Usuario con identificación ${identification} no encontrado`,
      );
    }

    if (userToUpdate.role === 'superadmin') {
      throw new ConflictException(
        'No se puede cambiar el rol de un superadmin',
      );
    }

    if (updateRole === 'superadmin') {
      throw new ConflictException(
        'No se puede asignar el rol de superadmin',
      );
    }

    const { data, error } = await this.supabaseService.client
      .from('users_profile')
      .update({ role: updateRole })
      .eq('identification', identification)
      .select(
        'identification, first_name, last_name, phone, email, role, is_active',
      )
      .single();

    if (error) throw new ConflictException(error);

    return {
      status: true,
      message: `Rol del usuario ${data.first_name} ${data.last_name} actualizado a ${updateRole} correctamente`,
      data: [data],
    };
  }

  async updateUserStatus(identification: number): Promise<CreateUserResponse> {
    const user = await this.findOne(identification);

    if (!user) {
      throw new NotFoundException(
        `Usuario con identificación ${identification} no encontrado`,
      );
    }
    const { data, error } = await this.supabaseService.client
      .from('users_profile')
      .update({ is_active: !user.is_active })
      .eq('identification', identification)
      .select(
        'identification, first_name, last_name, phone, email, role, is_active',
      )
      .single();

    if (error) throw new ConflictException(error);

    return {
      status: true,
      message: `Usuario ${data.is_active ? 'activado' : 'desactivado'} correctamente`,
      data: [data],
    };
  }
}
