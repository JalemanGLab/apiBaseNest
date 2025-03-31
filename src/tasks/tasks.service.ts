import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssistantsService } from 'src/modules/assistants/assistants.service';
import { PaymentsService } from 'src/modules/payments/payments.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly assistantsService: AssistantsService,
    private readonly paymentsService: PaymentsService,
  ) {}
  // @Cron('0 0 */8 * * *')
  // handleEvery8Hours() {
  //   console.log('Tarea ejecutada cada 8 horas');
  // }
  // @Cron('* * * * * *')
  // 0: segundo 0
  // *: cada minuto
  // *: cada hora
  // *: cada día del mes
  // *: cada mes
  // *: cada día de la semana
  @Cron(CronExpression.EVERY_8_HOURS)
  async handleEvery1Minute() {
    const response = await this.assistantsService.findAll();

    if (response.data) {
      const pendingPayments = response.data.filter(
        (assistant) =>
          (assistant.payment_status === 'PENDIENTE' ||
            assistant.payment_status === 'COMENZADA') &&
          assistant.transaction_id,
      );

      for (const assistant of pendingPayments) {
        await this.paymentsService.findTransaction(assistant.transaction_id);
      }
    }
  }
}
