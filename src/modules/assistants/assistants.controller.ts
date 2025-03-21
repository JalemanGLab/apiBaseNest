import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { AssistantsService } from './assistants.service';

import {CreateAssistantRequest} from 'src/types/assistants.type'
import { ValidateAssistantPipe } from 'src/common/pipe/assistants.pipe';


@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) { }


  @Post()
  @UsePipes(ValidateAssistantPipe)
  create(@Body() createRequest: CreateAssistantRequest) {
    return this.assistantsService.create(createRequest);
  }

  @Get()
  findAll() {
    return this.assistantsService.findAll();
  }



  // @Get()
  // //@UseGuards(JwtAuthGuard, RolesGuard)
  // //@Roles('admin', 'superadmin')
  // findAll() {
  //   return this.assistantsService.findAll();
  // }

  // @Get(':identification')
  // findOne(@Param('identification', ParseIntPipe) identification: number) {
  //   return this.assistantsService.findOne(identification);
  // }



  // @Put(':identification ')
  // update(
  //   @Param('identification', ParseIntPipe) identification: number,
  //   @Body() updateAssistantDto: Partial<Omit<Assistant, 'identification' | 'created_at'>>,
  // ) {
  //   return this.assistantsService.update(identification, updateAssistantDto);
  // }
}
