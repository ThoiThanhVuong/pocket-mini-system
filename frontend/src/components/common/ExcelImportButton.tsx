import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Can } from '@/components/common/Can';

interface ExcelImportButtonProps {
  endpoint: string;
  onSuccess: () => void;
  buttonText?: string;
  permission?: string;
}

export const ExcelImportButton: React.FC<ExcelImportButtonProps> = ({ 
  endpoint, 
  onSuccess,
  buttonText = 'Nhập Excel',
  permission
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error('Vui lòng chọn file Excel (.xlsx)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message || 'Nhập dữ liệu thành công');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nhập dữ liệu');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsImporting(false);
    }
  };

  const buttonContent = (
    <motion.button
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm disabled:opacity-50 h-[40px]"
      whileHover={isImporting ? {} : { scale: 1.05 }}
      whileTap={isImporting ? {} : { scale: 0.95 }}
      onClick={() => fileInputRef.current?.click()}
      disabled={isImporting}
    >
      {isImporting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />}
      {isImporting ? 'Đang nhập...' : buttonText}
    </motion.button>
  );

  const inputRender = (
    <input 
      type="file" 
      accept=".xlsx" 
      className="hidden" 
      ref={fileInputRef} 
      onChange={handleFileChange} 
    />
  );

  if (permission) {
    return (
      <Can permission={permission}>
        {inputRender}
        {buttonContent}
      </Can>
    );
  }

  return (
    <>
      {inputRender}
      {buttonContent}
    </>
  );
};
