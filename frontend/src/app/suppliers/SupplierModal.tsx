import React, { Component } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Supplier } from '@/types/partners/supplier';
import { PartnerStatus } from '@/types/partners/customer';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: (data: Partial<Supplier>) => Promise<void>;
}

interface SupplierModalState {
  errors: Partial<Record<string, string>>;
  isSubmitting: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0[0-9]{9,10})$/;

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
      <AlertCircle size={12} />
      <span>{msg}</span>
    </div>
  ) : null;

const inputClass = (error?: string) =>
  `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors ${
    error
      ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
      : 'border-gray-300 dark:border-gray-600'
  }`;

export class SupplierModal extends Component<SupplierModalProps, SupplierModalState> {
  constructor(props: SupplierModalProps) {
    super(props);
    this.state = { errors: {}, isSubmitting: false };
  }

  componentDidUpdate(prevProps: SupplierModalProps) {
    if (prevProps.supplier !== this.props.supplier) {
      this.setState({ errors: {}, isSubmitting: false });
    }
  }

  validate = (data: Record<string, string>) => {
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) errors.name = 'Tên nhà cung cấp không được để trống';
    else if (data.name.trim().length < 2) errors.name = 'Tên phải có ít nhất 2 ký tự';

    if (!data.contactPerson?.trim()) errors.contactPerson = 'Người liên hệ không được để trống';

    if (!data.email?.trim()) errors.email = 'Email không được để trống';
    else if (!EMAIL_REGEX.test(data.email.trim())) errors.email = 'Email không đúng định dạng';

    if (!data.phone?.trim()) errors.phone = 'Số điện thoại không được để trống';
    else if (!PHONE_REGEX.test(data.phone.trim()))
      errors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';

    if (!data.address?.trim()) errors.address = 'Địa chỉ không được để trống';

    return errors;
  };

  handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const raw = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      status: formData.get('status') as string,
    };

    const errors = this.validate(raw);
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    this.setState({ isSubmitting: true, errors: {} });
    try {
      await this.props.onSave({ ...raw, status: raw.status as PartnerStatus });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  clearError = (field: string) => {
    this.setState(prev => ({ errors: { ...prev.errors, [field]: undefined } }));
  };

  render() {
    const { isOpen, onClose, supplier } = this.props;
    const { errors, isSubmitting } = this.state;
    const isEditing = !!supplier;

    const modalVariants: Variants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.5, bounce: 0.4 } },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };
    const backdropVariants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
            />
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto z-10"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {isEditing ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                  </h2>
                  <motion.button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="p-6">
                  <form onSubmit={this.handleSubmit} key={supplier ? supplier.id : 'new'} noValidate>
                    {/* Name */}
                    <div className="mb-4">
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tên công ty / Nhà cung cấp <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        type="text"
                        id="name"
                        className={inputClass(errors.name)}
                        defaultValue={supplier?.name || ''}
                        placeholder="Nhập tên công ty"
                        onChange={() => this.clearError('name')}
                      />
                      <FieldError msg={errors.name} />
                    </div>

                    {/* Contact Person */}
                    <div className="mb-4">
                      <label htmlFor="contactPerson" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Người liên hệ <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="contactPerson"
                        type="text"
                        id="contactPerson"
                        className={inputClass(errors.contactPerson)}
                        defaultValue={supplier?.contactPerson || ''}
                        placeholder="Tên người liên hệ"
                        onChange={() => this.clearError('contactPerson')}
                      />
                      <FieldError msg={errors.contactPerson} />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          id="email"
                          className={inputClass(errors.email)}
                          defaultValue={supplier?.email || ''}
                          placeholder="email@company.com"
                          onChange={() => this.clearError('email')}
                        />
                        <FieldError msg={errors.email} />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          id="phone"
                          className={inputClass(errors.phone)}
                          defaultValue={supplier?.phone || ''}
                          placeholder="0901234567"
                          onChange={() => this.clearError('phone')}
                        />
                        <FieldError msg={errors.phone} />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        id="address"
                        rows={2}
                        className={inputClass(errors.address)}
                        defaultValue={supplier?.address || ''}
                        placeholder="Nhập địa chỉ đầy đủ"
                        onChange={() => this.clearError('address')}
                      />
                      <FieldError msg={errors.address} />
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                      <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trạng thái
                      </label>
                      <select
                        name="status"
                        id="status"
                        className={inputClass()}
                        defaultValue={supplier?.status || PartnerStatus.ACTIVE}
                      >
                        <option value={PartnerStatus.ACTIVE}>Hoạt động</option>
                        <option value={PartnerStatus.INACTIVE}>Không hoạt động</option>
                        <option value={PartnerStatus.BLOCKED}>Bị chặn</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <motion.button
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                      >
                        Hủy
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                      >
                        {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm nhà cung cấp'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
