import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateDistributorPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const missingFields = this.getMissingFields(value);
    if (missingFields.length > 0) {
      throw new BadRequestException(`Campos faltantes o inválidos: ${missingFields.join(', ')}`);
    }
    return value;
  }

  private getMissingFields(value: any): string[] {
    const missingFields: string[] = [];

    // Verificamos que exista el objeto
    if (!value) return ['request body is required'];

    const requiredFields = [
      'name',
      'city',
      'direction',
      'is_active',
    ];

    // Verificamos campos requeridos y sus tipos
    requiredFields.forEach(field => {
      if (value[field] === undefined || value[field] === null) {
        missingFields.push(field);
      } else {
        // Validación de tipos
        switch (field) {
          case 'is_active':
            if (typeof value[field] !== 'boolean') {
              missingFields.push(`${field} debe ser booleano`);
            }
            break;
          case 'name':
          case 'city':
          case 'direction':
            if (typeof value[field] !== 'string' || value[field].trim() === '') {
              missingFields.push(`${field} debe ser un texto no vacío`);
            }
            break;
        }
      }
    });

    return missingFields;
  }
}