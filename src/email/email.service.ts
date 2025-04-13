import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: any;
    contentType?: string;
  }[];
  template?: string;
  context?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection established');
    } catch (error) {
      this.logger.error(
        `Failed to establish email service connection: ${error.message}`,
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendTextEmail(
    to: string | string[],
    subject: string,
    text: string,
  ): Promise<boolean> {
    return this.sendEmail({ to, subject, text });
  }

  async sendHtmlEmail(
    to: string | string[],
    subject: string,
    html: string,
  ): Promise<boolean> {
    return this.sendEmail({ to, subject, html });
  }

  async sendTemplateEmail(options: EmailOptions): Promise<boolean> {
    if (!options.template) {
      this.logger.error('Template name is required');
      return false;
    }

    try {
      const templatePath = path.join(
        process.cwd(),
        'src/email/templates',
        `${options.template}.html`,
      );
      let template = fs.readFileSync(templatePath, 'utf8');

      if (options.context) {
        // Replace variables in template
        Object.keys(options.context).forEach((key) => {
          const regex = new RegExp(`{{ ${key} }}`, 'g');
          template = template.replace(regex, options.context[key]);
        });
      }

      return this.sendEmail({
        ...options,
        html: template,
      });
    } catch (error) {
      this.logger.error(`Failed to send template email: ${error.message}`);
      return false;
    }
  }
}
