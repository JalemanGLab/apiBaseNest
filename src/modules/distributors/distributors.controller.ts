import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { DistributorDto } from 'src/types/distributors.type';
import { ValidateDistributorPipe } from 'src/common/pipe/distributors.pipe';

@Controller('distributors')
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) { }

  @Get()
  findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Post()
  @UsePipes(ValidateDistributorPipe)
  create(@Body() createDistributorDto: DistributorDto) {
    return this.distributorsService.create(createDistributorDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDistributorDto: DistributorDto) {
    return this.distributorsService.update(id, updateDistributorDto);
  }


}
