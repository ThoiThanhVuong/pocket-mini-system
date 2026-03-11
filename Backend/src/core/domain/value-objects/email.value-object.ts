export class Email {
    private readonly value: string;

    constructor(email: string) {
        this.validate(email);
        this.value = email;
    }

    private validate(email: string): void {
        if (!email) {
            throw new Error('Email should not be empty');
        }
        
        // Simple regex for demonstration
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    public getValue(): string {
        return this.value;
    }

    public equals(other: Email): boolean {
        return other.getValue() === this.value;
    }

    public toString(): string {
        return this.value;
    }
}
