import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const smtpTransport = require('nodemailer-smtp-transport');

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('email.host');
    const port = this.configService.get<number>('email.port');
    const user = this.configService.get<string>('email.user');
    const pass = this.configService.get<string>('email.password');
    const from = this.configService.get<string>('email.from');

    if (host === 'localhost' || host === 'mailhog') {
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
      } as any);
      this.logger.log('Email service configured to use MailHog (development)');
    } else {
      this.transporter = nodemailer.createTransport(
        smtpTransport({
          host,
          port,
          auth: user && pass ? { user, pass } : undefined,
        }),
      );
    }

    this.transporter.verify((err) => {
      if (err) {
        this.logger.warn(`Email service verification failed: ${err.message}`);
      } else {
        this.logger.log('Email service is ready');
      }
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    const from = this.configService.get<string>('email.from') || 'noreply@wellbank.ng';

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Your WellBank OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">WellBank OTP Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Your WellBank OTP is: ${otp}. This code expires in 5 minutes.`,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Welcome to WellBank!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to WellBank, ${firstName}!</h2>
          <p>Thank you for joining WellBank - your unified healthcare platform.</p>
          <p>With WellBank, you can:</p>
          <ul>
            <li>Find and book consultations with doctors</li>
            <li>Order laboratory tests</li>
            <li>Get medications delivered</li>
            <li>Access emergency services</li>
            <li>Manage your health wallet</li>
          </ul>
          <p>Get started by completing your profile.</p>
        </div>
      `,
    });
  }
}
