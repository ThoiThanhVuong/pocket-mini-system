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

        const headerRow = worksheet.getRow(1);
        const headers: string[] = [];
        headerRow.eachCell((cell) => {
            headers.push(cell.value?.toString() || '');
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip headers
            const item: any = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                if (header) {
                    item[header] = cell.value;
                }
            });
            data.push(item);
        });

        return data;
    }
}
