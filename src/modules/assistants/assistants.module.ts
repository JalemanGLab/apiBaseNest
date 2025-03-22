import { Module } from '@nestjs/common';
import { AssistantsController } from './assistants.controller';
import { AssistantsService } from './assistants.service';
import { SupabaseModule } from 'src/config/supabase/supabase.module';
import { EmailModule } from 'src/config/email/email.module';

@Module({
  imports: [SupabaseModule, EmailModule],
  controllers: [AssistantsController],
  providers: [AssistantsService],
})
export class AssistantsModule {}