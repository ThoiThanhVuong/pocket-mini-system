export class StringUtil {
    static toSlug(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD') // Change 'đ' to 'd'
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .trim()
            .replace(/\s+/g, '-');
    }

    static generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
