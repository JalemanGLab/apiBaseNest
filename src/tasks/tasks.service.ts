import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {

  @Cron('0 0 */8 * * *')
  handleEvery8Hours() {
    console.log('Tarea ejecutada cada 8 horas');
  }




}