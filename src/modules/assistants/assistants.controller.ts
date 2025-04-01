import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AssistantsService } from './assistants.service';

import { CreateAssistantRequest } from 'src/types/assistants.type';
import { ValidateAssistantPipe } from 'src/common/pipe/assistants.pipe';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guard/roles.guard';
@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post()
  create(@Body() createRequest: CreateAssistantRequest) {
    return this.assistantsService.create(createRequest);
  }

  @Roles('admin', 'superadmin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.assistantsService.findAll();
  }

  @Patch('register-entry/:identification')
  @Roles('admin', 'superadmin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  registerEntry(@Param('identification') identification: number) {
    return this.assistantsService.registerEntry(identification);
  }
}
