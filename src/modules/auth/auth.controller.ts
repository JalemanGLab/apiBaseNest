import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

 


}
