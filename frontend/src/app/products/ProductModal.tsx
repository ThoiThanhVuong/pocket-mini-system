import React, { Component } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { Product } from '@/types/inventory/product';
import { ProductService } from '@/services/inventory/product.service';
import { Category } from '@/types/inventory/category';
import { CategoryService } from '@/services/inventory/category.service';
import { UploadService } from '@/services/common/upload.service';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: () => void;
}

interface ProductModalState {
  name: string;
  sku: string;
  price: number | '';
  description: string;
  unit: string;
  minStockLevel: number | '';
  categoryId: string;
  isActive: boolean;
  isSubmitting: boolean;
  error: string | null;
  categories: Category[];
  isLoadingCategories: boolean;
  imageFile: File | null;
  imagePreview: string;
}

export class ProductModal extends Component<ProductModalProps, ProductModalState> {
  constructor(props: ProductModalProps) {
    super(props);
    const p = props.product;
    this.state = {
      name: p?.name || '',
      sku: p?.sku || '',
      price: p?.price ?? '',
      description: p?.description || '',
      unit: p?.unit || 'cái',
      minStockLevel: p?.minStockLevel ?? 0,
      categoryId: p?.categoryId || '',
      isActive: p ? p.isActive : true,
      isSubmitting: false,
      error: null,
      categories: [],
      isLoadingCategories: false,
      imageFile: null,
      imagePreview: p?.image || ''
    };
  }

  async componentDidMount() {
    await this.loadCategories();
  }

  loadCategories = async () => {
    try {
      this.setState({ isLoadingCategories: true });
      const categories = await CategoryService.getAllCategories();
      this.setState({ categories, isLoadingCategories: false });
    } catch (error) {
      console.error('Failed to load categories:', error);
      this.setState({ isLoadingCategories: false });
    }
  };

  componentDidUpdate(prevProps: ProductModalProps) {
    // Nếu modal mở ra và product thay đổi
    if (this.props.isOpen && !prevProps.isOpen) {
      const p = this.props.product;
      this.setState({
        name: p?.name || '',
        sku: p?.sku || '',
        price: p?.price ?? '',
        description: p?.description || '',
        unit: p?.unit || 'cái',
        minStockLevel: p?.minStockLevel ?? 0,
        categoryId: p?.categoryId || '',
        isActive: p ? p.isActive : true,
        error: null,
        isSubmitting: false,
        imageFile: null,
        imagePreview: p?.image || ''
      });
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    this.setState({ [id]: value } as unknown as Pick<ProductModalState, keyof ProductModalState>);
  };

  handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    this.setState({ [id]: value === '' ? '' : Number(value) } as unknown as Pick<ProductModalState, keyof ProductModalState>);
  };

  handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ isActive: e.target.value === 'true' });
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ isSubmitting: true, error: null });

    const { name, sku, price, description, unit, minStockLevel, categoryId, isActive, imageFile, imagePreview } = this.state;
    const data: any = {
      name,
      sku,
      price: Number(price) || 0,
      description,
      unit,
      minStockLevel: Number(minStockLevel) || 0
    };

    if (imagePreview && !imageFile) {
        data.image = imagePreview;
    }

    if (categoryId) data.categoryId = categoryId;
    if (this.props.product) data.isActive = isActive;

    try {
      if (imageFile) {
        data.image = await UploadService.uploadFile(imageFile);
      }

      if (this.props.product) {
        await ProductService.updateProduct(this.props.product.id, data);
      } else {
        await ProductService.createProduct(data);
      }
      if (this.props.onSuccess) this.props.onSuccess();
      this.props.onClose();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      this.setState({
        error: error.response?.data?.message || error.message || 'Có lỗi xảy ra',
        isSubmitting: false
      });
    }
  };

  handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      this.setState({
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  render() {
    const { isOpen, onClose, product } = this.props;
    const { name, sku, price, description, unit, minStockLevel, categoryId, isActive, isSubmitting, error, categories, isLoadingCategories, imagePreview } = this.state;
    const isEditing = !!product;

    const modalVariants: Variants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.5, bounce: 0.4 } },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };
    // Helper to sort and indent categories
    const childrenMap = new Map<string | undefined, Category[]>();
    categories.forEach(c => {
      const pId = c.parentId || undefined;
      if (!childrenMap.has(pId)) childrenMap.set(pId, []);
      childrenMap.get(pId)!.push(c);
    });

    const sortedCategories: Category[] = [];
    const traverse = (pId: string | undefined) => {
      const children = childrenMap.get(pId) || [];
      children.sort((a,b) => a.name.localeCompare(b.name));
      children.forEach(child => {
        sortedCategories.push(child);
        traverse(child.id);
      });
    };
    traverse(undefined);

    const backdropVariants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto z-10 my-8"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
                
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                      {error}
                    </div>
                  )}

                  <form onSubmit={this.handleSubmit}>
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hình ảnh sản phẩm
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <input 
                           type="file" 
                           accept="image/*" 
                           onChange={this.handleImageChange} 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {imagePreview ? (
                          <div className="relative w-32 h-32 mx-auto">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md shadow-sm" />
                          </div>
                        ) : (
                          <motion.div className="mx-auto flex flex-col items-center" whileHover={{ scale: 1.02 }}>
                            <Upload className="text-gray-400 mb-2" size={24} />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Kéo thả hình ảnh vào đây, hoặc <span className="text-blue-600 dark:text-blue-400 font-medium">chọn tệp</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG hoặc GIF dưới 2MB</p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tên sản phẩm
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={name}
                          onChange={this.handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="sku" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mã SKU (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          id="sku"
                          value={sku}
                          onChange={this.handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Ex: PROD-001"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Danh mục
                        </label>
                        <select
                          id="categoryId"
                          value={categoryId}
                          onChange={this.handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          disabled={isLoadingCategories}
                        >
                          <option value="">Chọn danh mục</option>
                          {sortedCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {"\u00A0\u00A0\u00A0".repeat(cat.level || 0)}{cat.level > 0 ? "↳ " : ""}{cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Giá bán ($)
                        </label>
                        <input
                          type="number"
                          id="price"
                          min="0"
                          value={price}
                          onChange={this.handleNumberChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor="unit" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Đơn vị
                        </label>
                        <input
                          type="text"
                          id="unit"
                          required
                          value={unit}
                          onChange={this.handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="minStockLevel" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tồn tối thiểu
                        </label>
                        <input
                          type="number"
                          id="minStockLevel"
                          min="0"
                          value={minStockLevel}
                          onChange={this.handleNumberChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          title="Cảnh báo khi lượng tồn kho các kho dự trữ bị nhỏ hơn số này"
                        />
                      </div>
                      {isEditing && (
                        <div>
                          <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Trạng thái
                          </label>
                          <select
                            id="status"
                            value={isActive ? 'true' : 'false'}
                            onChange={this.handleStatusChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="true">Đang bán</option>
                            <option value="false">Ngừng kinh doanh</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mô tả
                      </label>
                      <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={this.handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </motion.button>
                      <motion.button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm sản phẩm')}
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