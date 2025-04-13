import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmailService } from './email.service';

interface AlertNotificationDto {
  to: string;
  userName: string;
  alertType: string;
  alertTitle: string;
  alertMessage: string;
  alertTime: string;
  alertDescription: string;
  alertColor: string;
  appUrl: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('alert-notification')
  async sendAlertNotification(@Body() alertDto: AlertNotificationDto) {
    try {
      const result = await this.emailService.sendTemplateEmail({
        to: alertDto.to,
        subject: `Baby Health Alert: ${alertDto.alertTitle}`,
        template: 'alert-notification',
        context: {
          userName: alertDto.userName,
          alertType: alertDto.alertType,
          alertTitle: alertDto.alertTitle,
          alertMessage: alertDto.alertMessage,
          alertTime: alertDto.alertTime,
          alertDescription: alertDto.alertDescription,
          alertColor: alertDto.alertColor || '#FF6B6B', // Default red color if not provided
          appUrl: alertDto.appUrl,
        },
      });

      if (!result) {
        throw new HttpException(
          'Failed to send alert notification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        status: 'success',
        message: 'Alert notification sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send alert notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
