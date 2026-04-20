import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
    async generateReport(title: string, columns: { header: string; key: string; width: number }[], data: any[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(title);

        // Add title row
        const titleRow = worksheet.addRow([title]);
        titleRow.font = { name: 'Arial', size: 16, bold: true };
        worksheet.mergeCells(1, 1, 1, columns.length);
        titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.addRow([]); // Empty row

        // Add headers
        const headerRow = worksheet.addRow(columns.map(col => col.header));
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add data
        data.forEach(item => {
            const rowData = columns.map(col => item[col.key]);
            const row = worksheet.addRow(rowData);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Adjust column widths
        columns.forEach((col, index) => {
            worksheet.getColumn(index + 1).width = col.width;
        });

        const arrayBuffer = await workbook.xlsx.writeBuffer();
        if (Buffer.isBuffer(arrayBuffer)) {
            return arrayBuffer;
        }
        return Buffer.from(arrayBuffer);
    }

    async parseExcel(buffer: Buffer): Promise<any[]> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const worksheet = workbook.getWorksheet(1);
        const data: any[] = [];
        
        if (!worksheet) return [];

        // Get headers from row 1 robustly
        const headerRowValues = worksheet.getRow(1).values as any[];
        const headers: string[] = [];
        // headers start from index 1 in ExcelJS values array
        for (let i = 1; i < headerRowValues.length; i++) {
            const val = headerRowValues[i];
            headers.push(val ? val.toString().trim() : '');
        }

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip headers
            const item: any = {};
            const rowValues = row.values as any[];
            
            headers.forEach((header, index) => {
                if (!header) return;
                const cellValue = rowValues[index + 1];
                // Clean up value: trim if string
                let value = cellValue;
                if (typeof cellValue === 'string') {
                    value = cellValue.trim();
                } else if (cellValue && typeof cellValue === 'object' && 'text' in cellValue) {
                    // Handle RichText or other objects
                    value = (cellValue as any).text.toString().trim();
                }
                
                item[header] = value;
            });
            
            // Only add if row is not completely empty
            if (Object.values(item).some(v => v !== null && v !== undefined && v !== '')) {
                data.push(item);
            }
        });

        return data;
    }

    async generateTemplate(sheetName: string, headers: string[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        // Add headers at row 1
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Set default column width
        worksheet.columns = headers.map(() => ({ width: 20 }));

        const arrayBuffer = await workbook.xlsx.writeBuffer();
        if (Buffer.isBuffer(arrayBuffer)) {
            return arrayBuffer;
        }
        return Buffer.from(arrayBuffer);
    }
}
