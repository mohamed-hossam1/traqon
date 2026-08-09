import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Email } from './interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.defaultFrom =
      this.configService.get<string>('EMAIL_FROM') || 'noreply@traqon.tech';
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async send(email: Email): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY not configured. Skipped sending email to ${email.to}`,
      );
      return false;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to: email.to,
        subject: email.subject,
        html: email.html,
      });

      if (response?.error) {
        this.logger.error(
          `Failed to send email to ${email.to}: ${JSON.stringify(response.error)}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Unexpected error sending email to ${email.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
