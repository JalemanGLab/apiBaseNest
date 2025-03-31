import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ValidateAssistantPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const missingFields = this.getMissingFields(value);
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Campos faltantes: ${missingFields.join(', ')}`,
      );
    }
    return value;
  }

  private getMissingFields(value: any): string[] {
    const missingFields: string[] = [];

    // Primero verificamos que exista el objeto y sus propiedades principales
    if (!value) return ['request body is required'];
    if (!value.assistant) return ['assistant is required'];

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
      'contact',
    ];

    // Verificamos campos del asistente
    requiredFields.forEach((field) => {
      if (
        value.assistant[field] === undefined ||
        value.assistant[field] === null
      ) {
        missingFields.push(`assistant.${field}`);
      }
    });

    // Verificamos tipos de datos
    if (
      value.assistant.identification !== undefined &&
      typeof value.assistant.identification !== 'number'
    ) {
      missingFields.push('identification debe ser número');
    }

    if (
      value.assistant.contact !== undefined &&
      typeof value.assistant.contact !== 'boolean'
    ) {
      missingFields.push('contact debe ser booleano');
    }

    return missingFields;
  }
}
