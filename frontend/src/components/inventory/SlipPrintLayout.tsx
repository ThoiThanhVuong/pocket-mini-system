import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface SlipPrintLayoutProps {
  type: 'IN' | 'OUT' | 'TRANSFER';
  data: any;
  companyInfo?: {
    name: string;
    address: string;
  };
}

const numberToVietnameseText = (number: number): string => {
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
        let unitsValue = group % 10;
        let text = '';
        
        if (hundreds > 0 || hasHigher) {
            text += digits[hundreds] + ' trăm';
        }
        
        if (tens > 1) {
            text += (text ? ' ' : '') + digits[tens] + ' mươi';
            if (unitsValue === 1) text += ' mốt';
            else if (unitsValue === 5) text += ' lăm';
            else if (unitsValue > 0) text += ' ' + digits[unitsValue];
        } else if (tens === 1) {
            text += (text ? ' ' : '') + 'mười';
            if (unitsValue === 5) text += ' lăm';
            else if (unitsValue > 0) text += ' ' + digits[unitsValue];
        } else if (tens === 0 && unitsValue > 0) {
            if (text) text += ' lẻ ' + digits[unitsValue];
            else text += digits[unitsValue];
        }
        
        return text;
    }
    
    const result = res.trim();
    return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
};

export const SlipPrintLayout: React.FC<SlipPrintLayoutProps> = ({ type, data, companyInfo }) => {
  const user = useAuthStore.getState().user;
  const currentDate = new Date(data.createdAt || new Date());
  
  const title = type === 'IN' ? 'PHIẾU NHẬP KHO' : type === 'OUT' ? 'PHIẾU XUẤT KHO' : 'PHIẾU ĐIỀU CHUYỂN KHO';
  const mẫuSố = type === 'IN' ? '01-VT' : type === 'OUT' ? '02-VT' : '03-VT';

  const totalAmount = (data.items || []).reduce((acc: number, item: any) => acc + (Number(item.quantity) * (Number(item.price) || Number(item.unitPrice) || 0)), 0);

  return (
    <div className="print-container p-10 bg-white text-black font-sans text-xs leading-snug" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', boxSizing: 'border-box' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        .print-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
          .print-container { 
            width: 210mm !important; 
            height: 297mm !important; 
            padding: 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
        .print-table th, .print-table td { border: 1px solid #000; padding: 6px 4px; }
        .print-table { border-collapse: collapse; width: 100%; font-size: 11px; }
        .logo-placeholder { 
            width: 60px; 
            height: 60px; 
            border: 1px dashed #ccc; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-size: 10px;
            color: #999;
            margin-bottom: 5px;
        }
      `}</style>

      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-4">
          <div className="logo-placeholder">LOGO</div>
          <div>
            <p className="font-bold text-sm uppercase leading-tight">{companyInfo?.name || 'POCKET MINI SYSTEM'}</p>
            <p className="text-[10px] italic">Giải pháp quản lý kho thông minh</p>
            <p className="text-[10px]">Địa chỉ: {companyInfo?.address || '................................................'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">Mẫu số: {mẫuSố}</p>
          <p className="text-[10px]">(Ban hành theo Thông tư số 200/2014/TT-BTC</p>
          <p className="text-[10px]">Ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold mb-1 tracking-widest">{title}</h1>
        <p className="italic text-[11px]">Ngày {currentDate.getDate()} tháng {currentDate.getMonth() + 1} năm {currentDate.getFullYear()}</p>
        <div className="flex justify-center gap-12 mt-3 font-semibold">
            <p>Số: <span>{data.referenceCode || data.id?.slice(0, 8).toUpperCase()}</span></p>
            <p>Nợ: ........</p>
            <p>Có: ........</p>
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-1.5 mb-6 text-[12px]">
        <p><span className="w-48 inline-block">- Họ và tên người {type === 'IN' ? 'giao' : 'nhận'}:</span> <span className="font-bold">{data.customerName || data.supplierName || '................................................'}</span></p>
        <p><span className="w-48 inline-block">- Lý do {type === 'IN' ? 'nhập' : 'xuất'}:</span> {data.notes || '................................................'}</p>
        <p><span className="w-48 inline-block">- {type === 'IN' ? 'Nhập' : 'Xuất'} tại kho:</span> <span className="font-bold">{data.warehouseName || '................'}</span></p>
      </div>

      {/* Table */}
      <table className="print-table mb-4">
        <thead>
          <tr className="text-center font-bold bg-gray-100 italic">
            <th style={{ width: '5%' }}>STT</th>
            <th style={{ width: '35%' }}>Tên, nhãn hiệu, quy cách hàng hóa</th>
            <th style={{ width: '12%' }}>Mã số</th>
            <th style={{ width: '8%' }}>ĐVT</th>
            <th style={{ width: '10%' }}>Số lượng</th>
            <th style={{ width: '15%' }}>Đơn giá</th>
            <th style={{ width: '15%' }}>Thành tiền</th>
          </tr>
          <tr className="text-[9px] text-center bg-gray-50">
            <td>A</td>
            <td>B</td>
            <td>C</td>
            <td>D</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
          </tr>
        </thead>
        <tbody>
          {(data.items || []).map((item: any, index: number) => (
            <tr key={index}>
              <td className="text-center">{index + 1}</td>
              <td className="pl-2 font-medium">{item.productName || item.product?.name || 'Sản phẩm ' + item.productId}</td>
              <td className="text-center">{item.productSku || item.product?.sku || item.productId?.slice(0,6).toUpperCase()}</td>
              <td className="text-center">{item.unit || 'Cái'}</td>
              <td className="text-center font-bold">{item.quantity}</td>
              <td className="text-right pr-2">{(Number(item.price) || Number(item.unitPrice) || 0).toLocaleString()}</td>
              <td className="text-right pr-2 font-bold">{(Number(item.quantity) * (Number(item.price) || Number(item.unitPrice) || 0)).toLocaleString()}</td>
            </tr>
          ))}
          {/* Fill empty rows to maintain structure */}
          {Array.from({ length: Math.max(0, 8 - (data.items?.length || 0)) }).map((_, i) => (
            <tr key={'empty-' + i} style={{ height: '24px' }}>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td colSpan={6} className="text-right pr-4 uppercase text-[10px]">Cộng tiền hàng:</td>
            <td className="text-right pr-2">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary */}
      <div className="space-y-1.5 mb-10 text-[12px]">
        <p>- Tổng số tiền viết bằng chữ: <span className="italic font-bold">{numberToVietnameseText(totalAmount)}</span></p>
        <p>- Số chứng từ gốc kèm theo: ........................................................................</p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-5 text-center text-[10px] leading-tight">
        <div className="flex flex-col">
          <p className="font-bold">Người lập phiếu</p>
          <p className="italic mb-20">(Ký, họ tên)</p>
          <p className="font-bold">{user?.fullName || '................'}</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Người {type === 'IN' ? 'giao' : 'nhận'} hàng</p>
          <p className="italic mb-20">(Ký, họ tên)</p>
          <p className="font-bold text-white">.</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Thủ kho</p>
          <p className="italic mb-20">(Ký, họ tên)</p>
          <p className="font-bold text-white">.</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Kế toán trưởng</p>
          <p className="italic mb-20">(Ký, họ tên)</p>
          <p className="font-bold text-white">.</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold uppercase">Giám đốc</p>
          <p className="italic mb-20">(Ký, đóng dấu)</p>
          <p className="font-bold text-white">.</p>
        </div>
      </div>
      
      <div className="mt-12 text-right italic text-[10px]">
        Xuất ngày {currentDate.getDate()} tháng {currentDate.getMonth() + 1} năm {currentDate.getFullYear()}
      </div>
    </div>
  );
};
