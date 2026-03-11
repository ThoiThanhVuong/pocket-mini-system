export interface IEmailService {
    sendWelcomeEmail(email: string, fullName: string): Promise<void>;
}

export const EmailServiceKey = 'IEmailService';
