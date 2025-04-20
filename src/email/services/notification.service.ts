import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AlertNotificationDto } from '../interfaces/alert-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAlertNotification(
    notification: AlertNotificationDto,
  ): Promise<void> {
    switch (notification.type) {
      case 'counter-started':
        await this.sendCounterStartedNotification(notification);
        break;
      case 'counter-completed':
        await this.sendCounterCompletedNotification(notification);
        break;
      case 'contraction-alert':
        await this.sendContractionAlertNotification(notification);
        break;
      default:
        throw new Error(`Unsupported notification type: ${notification.type}`);
    }
  }

  private async sendCounterStartedNotification(
    notification: AlertNotificationDto,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: notification.to,
      subject: 'Kick Counter Session Started - Baby Health App',
      template: 'counter-started',
      context: {
        userName: notification.userName,
        startTime: notification.startTime,
        targetKicks: notification.targetKicks,
        appUrl: notification.appUrl,
      },
    });
  }

  private async sendCounterCompletedNotification(
    notification: AlertNotificationDto,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: notification.to,
      subject: 'Kick Counter Results - Baby Health App',
      template: 'counter-completed',
      context: {
        userName: notification.userName,
        totalKicks: notification.totalKicks,
        duration: notification.duration,
        startedAt: notification.startTime,
        completedAt: notification.completedAt,
        appUrl: notification.appUrl,
      },
    });
  }

  private async sendContractionAlertNotification(
    notification: AlertNotificationDto,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: notification.to,
      subject: 'Important: Low Contraction Activity Detected',
      template: 'alert-notification',
      context: {
        alertColor: notification.alertColor || '#e74c3c', // Red for warning
        alertType: 'Contraction Activity',
        alertTitle: notification.alertTitle || 'Low Contraction Activity Alert',
        userName: notification.userName,
        alertMessage:
          notification.alertMessage ||
          `You've had only ${notification.actualCount} contractions in the monitoring period (minimum recommended: ${notification.minimumCount}).`,
        alertTime: notification.alertTime || new Date().toLocaleString(),
        alertDescription:
          notification.alertDescription ||
          'Regular contraction monitoring is important for tracking your labor progress. Please check your health status and consult your healthcare provider if necessary.',
        appUrl: notification.appUrl,
      },
    });
  }
}
