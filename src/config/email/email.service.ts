import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private  instanceApi: TransactionalEmailsApi

  constructor(private configService: ConfigService) {
    this.instanceApi = new TransactionalEmailsApi();
    this.instanceApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey, 
      this.configService.get<string>('BREVO_API_KEY') as string
    );
  }

  async sendEmail() {
    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = 'asusnto';
      sendSmtpEmail.sender = {name: 'Congreso Magno Colombia', email: this.configService.get<string>('BREVO_SENDER_EMAIL') as string };
      sendSmtpEmail.to = [{name: 'Javier Settex', email: 'javiersettex@gmail.com' }];
      sendSmtpEmail.htmlContent = '<p>Hola</p>';
      const response = await this.instanceApi.sendTransacEmail(sendSmtpEmail);
      console.log(response);
    } catch (error) {
      console.log("=============")
      console.log("Error al enviar el correo", error);
      console.log("=============")
      throw new Error(error);
    }
   
  }

 
}