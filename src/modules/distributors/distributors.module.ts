import { Module } from '@nestjs/common';
import { DistributorsController } from './distributors.controller';
import { DistributorsService } from './distributors.service';
import { SupabaseModule } from 'src/config/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DistributorsController],
  providers: [DistributorsService],
})
export class DistributorsModule {}