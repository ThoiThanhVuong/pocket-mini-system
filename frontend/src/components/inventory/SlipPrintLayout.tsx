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
    <div className="print-container p-8 bg-white text-black font-serif text-sm leading-relaxed" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
          @page { size: A4; margin: 10mm; }
        }
        .print-table th, .print-table td { border: 1px solid black; padding: 4px 8px; }
        .print-table { border-collapse: collapse; width: 100%; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <p className="font-bold uppercase">Đơn vị: {companyInfo?.name || 'Pocket Mini System'}</p>
          <p>Địa chỉ: {companyInfo?.address || '................................................'}</p>
        </div>
        <div className="text-center">
          <p className="font-bold">Mẫu số {mẫuSố}</p>
          <p className="text-xs">(Ban hành theo Thông tư số 200/2014/TT-BTC</p>
          <p className="text-xs">Ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p className="italic">Ngày {currentDate.getDate()} tháng {currentDate.getMonth() + 1} năm {currentDate.getFullYear()}</p>
        <div className="flex justify-center gap-8 mt-2">
            <p>Số: <span className="font-bold">{data.referenceCode || data.id?.slice(0, 8)}</span></p>
            <p>Nợ: ........</p>
            <p>Có: ........</p>
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-2 mb-6">
        <p>- Họ và tên người {type === 'IN' ? 'giao' : 'nhận'}: {data.customerName || data.supplierName || '................................................'}</p>
        <p>- Lý do {type === 'IN' ? 'nhập' : 'xuất'}: {data.notes || '................................................'}</p>
        <p>- {type === 'IN' ? 'Nhập' : 'Xuất'} tại kho: <span className="font-bold">{data.warehouseName || '................'}</span> - Địa điểm: ................................</p>
      </div>

      {/* Table */}
      <table className="print-table mb-6">
        <thead>
          <tr className="text-center font-bold bg-gray-50">
            <th style={{ width: '40px' }}>STT</th>
            <th>Tên, nhãn hiệu, quy cách, phẩm chất hàng hóa</th>
            <th style={{ width: '80px' }}>Mã số</th>
            <th style={{ width: '60px' }}>ĐVT</th>
            <th style={{ width: '70px' }}>Số lượng</th>
            <th style={{ width: '100px' }}>Đơn giá</th>
            <th style={{ width: '120px' }}>Thành tiền</th>
          </tr>
          <tr className="text-xs italic text-center">
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
              <td>{item.productName || item.product?.name || 'Sản phẩm ' + item.productId}</td>
              <td className="text-center">{item.productSku || item.product?.sku || item.productId?.slice(0,6)}</td>
              <td className="text-center">{item.unit || 'Cái'}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{(Number(item.price) || Number(item.unitPrice) || 0).toLocaleString()}</td>
              <td className="text-right">{(Number(item.quantity) * (Number(item.price) || Number(item.unitPrice) || 0)).toLocaleString()}</td>
            </tr>
          ))}
          {/* Fill empty rows if needed to make it look like the form */}
          {Array.from({ length: Math.max(0, 5 - (data.items?.length || 0)) }).map((_, i) => (
            <tr key={'empty-' + i} style={{ height: '24px' }}>
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={6} className="text-right uppercase">Cộng:</td>
            <td className="text-right">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary */}
      <div className="space-y-2 mb-10">
        <p>- Tổng số tiền viết bằng chữ: <span className="italic font-bold">{numberToVietnameseText(totalAmount)}</span></p>
        <p>- Số chứng từ gốc kèm theo: ........................................................................</p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-5 text-center text-xs space-y-0">
        <div className="flex flex-col">
          <p className="font-bold">Người lập phiếu</p>
          <p className="italic mb-16">(Ký, họ tên)</p>
          <p>{user?.fullName || '................'}</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Người {type === 'IN' ? 'giao' : 'nhận'} hàng</p>
          <p className="italic mb-16">(Ký, họ tên)</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Thủ kho</p>
          <p className="italic mb-16">(Ký, họ tên)</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Kế toán trưởng</p>
          <p className="italic mb-16">(Ký, họ tên)</p>
        </div>
        <div className="flex flex-col">
          <p className="font-bold">Giám đốc</p>
          <p className="italic mb-16">(Ký, họ tên, đóng dấu)</p>
        </div>
      </div>
      
      <div className="mt-8 text-right italic text-xs">
        Ngày {currentDate.getDate()} tháng {currentDate.getMonth() + 1} năm {currentDate.getFullYear()}
      </div>
    </div>
  );
};
