import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './config/supabase/supabase.module';
import { EmailModule } from './config/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssistantsModule } from './modules/assistants/assistants.module';
import { DistributorsModule } from './modules/distributors/distributors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    EmailModule,
    AssistantsModule,
    DistributorsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
