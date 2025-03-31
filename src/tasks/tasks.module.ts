import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AssistantsModule } from '../modules/assistants/assistants.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { SupabaseModule } from 'src/config/supabase/supabase.module';

@Module({
  imports: [AssistantsModule, PaymentsModule, SupabaseModule],
  providers: [TasksService],
})
export class TasksModule {}