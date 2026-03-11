import { BaseEntity } from "../base.entity";
import { Product } from "./product.entity";
import { StockTransfer } from "./stock-transfer.entity"; // Import đúng file đã sửa
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('stock_transfer_items')
export class StockTransferItem extends BaseEntity {
    @ManyToOne(() => StockTransfer, (stockTransfer) => stockTransfer.stockTransferItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stock_transfer_id' })
    stockTransfer: StockTransfer;
    
    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(() => Product, (product) => product.stockTransferItems)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'quantity' })
    quantity: number;
}
