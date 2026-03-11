import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    // Giả lập gửi email (thực tế sẽ dùng Nodemailer, SendGrid, Amazon SES...)
    async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
        this.logger.log(`Start sending welcome email to ${email}`);

        try {
            // Code gọi API bên thứ 3 sẽ nằm ở đây
            // Ví dụ: await transporter.sendMail(...)
            
            console.log(`[>> EXTERNAL API CALL] Sending email to ${email}: "Welcome ${name}!"`);
            
            this.logger.log(`Email sent successfully to ${email}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${email}`, error);
            return false;
        }
    }
}
