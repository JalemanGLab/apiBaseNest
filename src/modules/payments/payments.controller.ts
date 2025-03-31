import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentTransactionRequest } from 'src/types/payment.type';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() paymentRequest: PaymentTransactionRequest) {
    return this.paymentsService.createTransaction(paymentRequest);
  }

  @Get('transaction/:id')
  findTransaction(@Param('id') id: string) {
    return this.paymentsService.findTransaction(Number(id));
  }
}
