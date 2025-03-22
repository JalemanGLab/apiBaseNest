import {
	Injectable,
} from '@nestjs/common';
import { SupabaseService } from 'src/config/supabase/supabase.service';
import { DistributorDto } from 'src/types/distributors.type';


@Injectable()
export class DistributorsService {
	constructor(
		private supabaseService: SupabaseService,

	) { }

	async findAll() {
		const { data, error } = await this.supabaseService.client.from('distributors').select('*');
		if (error) {
			throw new Error(error.message);
		}
		return data;
	}

	async findOne(id: string) {
		const { data, error } = await this.supabaseService.client.from('distributors').select('*').eq('id', id);
		if (error) {
			throw new Error(error.message);
		}
		return data;
	}

	async create(createDistributorDto: DistributorDto) {
		const { data, error } = await this.supabaseService.client
			.from('distributors')
			.insert(createDistributorDto)
			.select()
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return {
			status: true,
			message: 'Distribuidor creado exitosamente',
			data: {
				name: data.name,
				city: data.city,
				direction: data.direction,
				is_active: data.is_active
			}
		};
	}

	async update(id: string, updateDistributorDto: DistributorDto) {
		const { data, error } = await this.supabaseService.client
			.from('distributors')
			.update(updateDistributorDto)
			.eq('id', id)
			.select()
			.single();
	
		if (error) {
			throw new Error(error.message);
		}
	
		return {
			status: true,
			message: 'Distribuidor actualizado exitosamente',
			data: {
				name: data.name,
				city: data.city,
				direction: data.direction,
				is_active: data.is_active
			}
		};
	}






}
