import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL no está definido en las variables de entorno');
    }

    if (!supabaseKey) {
      throw new Error('SUPABASE_ANON_KEY no está definido en las variables de entorno');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  async testConnection() {
    try {
      const { count, error } = await this.supabase
        .from('user')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          status: 'error',
          message: error.message,
          details: error
        };
      }

      return {
        status: 'success',
        message: 'Conexión exitosa con Supabase',
        details: {
          timestamp: new Date().toISOString(),
          totalUsers: count,
          tableAccessed: 'users'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al conectar con Supabase',
        details: error
      };
    }
  }
}