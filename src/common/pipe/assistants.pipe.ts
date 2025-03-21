import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateAssistantPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const missingFields = this.getMissingFields(value);
    if (missingFields.length > 0) {
      throw new BadRequestException(`Campos faltantes: ${missingFields.join(', ')}`);
    }
    return value;
  }

  private getMissingFields(value: any): string[] {
    const missingFields: string[] = [];

    // Primero verificamos que exista el objeto y sus propiedades principales
    if (!value) return ['request body is required'];
    if (!value.assistant) return ['assistant is required'];
    if (!value.payment) return ['payment is required'];

    const requiredFields = [
      'identification',
      'first_name',
      'last_name',
      'phone',
      'email',
      'city',
      'distributor',
      'main_procedure',
      'product_brand',
      'weekly_procedure',
      'contact'
    ];

    // Verificamos campos del asistente
    requiredFields.forEach(field => {
      if (value.assistant[field] === undefined || value.assistant[field] === null) {
        missingFields.push(`assistant.${field}`);
      }
    });

    // Verificamos tipos de datos
    if (value.assistant.identification !== undefined && typeof value.assistant.identification !== 'number') {
      missingFields.push('identification debe ser número');
    }

    if (value.assistant.contact !== undefined && typeof value.assistant.contact !== 'boolean') {
      missingFields.push('contact debe ser booleano');
    }

    // Verificamos campos del pago
    if (!value.payment.type) {
      missingFields.push('payment.type');
    }

    if (!value.payment.value) {
      missingFields.push('payment.value');
    }

    // Verificamos campos específicos según el tipo de pago
    if (value.payment.type === 'PSE') {
      if (!value.payment.pse?.bank) {
        missingFields.push('payment.pse.bank');
      }
      if (!value.payment.pse?.type_person) {
        missingFields.push('payment.pse.type_person');
      }
    } else if (value.payment.type === 'card') {
      if (!value.payment.card?.name) {
        missingFields.push('payment.card.name');
      }
      if (!value.payment.card?.number) {
        missingFields.push('payment.card.number');
      }
      if (!value.payment.card?.expiration_date) {
        missingFields.push('payment.card.expiration_date');
      }
      if (!value.payment.card?.cvv) {
        missingFields.push('payment.card.cvv');
      }
    }

    return missingFields;
  }
}