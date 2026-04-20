import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Can } from '@/components/common/Can';

interface ExcelImportButtonProps {
  endpoint: string;
  onSuccess: () => void;
  buttonText?: string;
  permission?: string;
  templateEndpoint?: string;
}

export const ExcelImportButton: React.FC<ExcelImportButtonProps> = ({ 
  endpoint, 
  onSuccess,
  buttonText = 'Nhập Excel',
  permission,
  templateEndpoint
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    if (!templateEndpoint) return;
    setIsDownloadingTemplate(true);
    try {
      const response = await api.get(templateEndpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mau-nhap-du-lieu.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải file mẫu');
    } catch (error) {
      toast.error('Không thể tải file mẫu');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

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

  const mainButton = (
    <div className="relative group">
      <motion.button
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-l-lg flex items-center shadow-lg shadow-emerald-500/20 disabled:opacity-50 h-[42px] font-medium transition-all"
        whileHover={isImporting ? {} : { x: -2 }}
        whileTap={isImporting ? {} : { scale: 0.98 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        onMouseEnter={() => setHovered('import')}
        onMouseLeave={() => setHovered(null)}
      >
        {isImporting ? (
          <Loader2 size={18} className="mr-2 animate-spin" />
        ) : (
          <Upload size={18} className="mr-2" />
        )}
        <span className="whitespace-nowrap">{isImporting ? 'Đang nhập...' : buttonText}</span>
      </motion.button>
    </div>
  );

  const templateButton = templateEndpoint && (
    <div className="relative border-l border-emerald-500/30">
      <motion.button
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-r-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 disabled:opacity-50 h-[42px] transition-all"
        whileHover={isDownloadingTemplate ? {} : { x: 2 }}
        whileTap={isDownloadingTemplate ? {} : { scale: 0.98 }}
        onClick={handleDownloadTemplate}
        disabled={isDownloadingTemplate}
        onMouseEnter={() => setHovered('template')}
        onMouseLeave={() => setHovered(null)}
        title="Tải file mẫu Excel"
      >
        {isDownloadingTemplate ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={18} />
        )}
      </motion.button>
      
      <AnimatePresence>
        {hovered === 'template' && !isDownloadingTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-[-40px] right-0 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 shadow-xl pointer-events-none"
          >
            Tải file mẫu
            <div className="absolute bottom-[-4px] right-3 w-2 h-2 bg-gray-900 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const buttonGroup = (
    <div className="flex items-center">
      {mainButton}
      {templateButton}
    </div>
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

  const content = (
    <>
      {inputRender}
      {buttonGroup}
    </>
  );

  if (permission) {
    return (
      <Can permission={permission}>
        {content}
      </Can>
    );
  }

  return content;
};

