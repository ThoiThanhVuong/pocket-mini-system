export function numberToVietnameseText(number: number): string {
    if (number === 0) return 'Không đồng';
    
    const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    
    let res = '';
    let unitIdx = 0;
    
    let n = Math.abs(number);
    
    while (n > 0) {
        let group = n % 1000;
        if (group > 0) {
            let groupText = readGroup(group, n >= 1000);
            res = groupText + units[unitIdx] + (res ? ' ' + res : '');
        }
        n = Math.floor(n / 1000);
        unitIdx++;
    }
    
    function readGroup(group: number, hasHigher: boolean): string {
        let hundreds = Math.floor(group / 100);
        let tens = Math.floor((group % 100) / 10);
        let units = group % 10;
        let text = '';
        
        if (hundreds > 0 || hasHigher) {
            text += digits[hundreds] + ' trăm';
        }
        
        if (tens > 1) {
            text += (text ? ' ' : '') + digits[tens] + ' mươi';
            if (units === 1) text += ' mốt';
            else if (units === 5) text += ' lăm';
            else if (units > 0) text += ' ' + digits[units];
        } else if (tens === 1) {
            text += (text ? ' ' : '') + 'mười';
            if (units === 5) text += ' lăm';
            else if (units > 0) text += ' ' + digits[units];
        } else if (tens === 0 && units > 0) {
            if (text) text += ' lẻ ' + digits[units];
            else text += digits[units];
        }
        
        return text;
    }
    
    const result = res.trim();
    return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
}
