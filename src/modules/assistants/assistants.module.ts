import { Module } from '@nestjs/common';
import { AssistantsController } from './assistants.controller';
import { AssistantsService } from './assistants.service';
import { SupabaseModule } from 'src/config/supabase/supabase.module';


@Module({
  imports: [SupabaseModule],
  controllers: [AssistantsController],
  providers: [AssistantsService],
})
export class AssistantsModule {}