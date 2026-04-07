import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../../infrastructure/database/entities/partners/supplier.entity';
import { Customer } from '../../infrastructure/database/entities/partners/customer.entity';
import { CustomerController } from '../../presentation/controllers/partners/customer.controller';
import { SupplierController } from '../../presentation/controllers/partners/supplier.controller';
import { CustomerService } from '../../application/use-cases/partners/customer.service';
import { SupplierService } from '../../application/use-cases/partners/supplier.service';
import { CustomerRepository } from '../../infrastructure/database/repositories/partners/customer.repository';
import { SupplierRepository } from '../../infrastructure/database/repositories/partners/supplier.repository';
import { ICustomerServiceKey } from '../../core/interfaces/services/partners/customer.service.interface';
import { ISupplierServiceKey } from '../../core/interfaces/services/partners/supplier.service.interface';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Customer]), SystemModule],
  controllers: [CustomerController, SupplierController],
  providers: [
    CustomerService,
    SupplierService,
    { provide: 'ICustomerRepository', useClass: CustomerRepository },
    { provide: 'ISupplierRepository', useClass: SupplierRepository },
    { provide: 'ICustomerService', useClass: CustomerService }, // Optional if using class token
    { provide: 'ISupplierService', useClass: SupplierService }, // Optional if using class token
    { provide: ICustomerServiceKey, useClass: CustomerService},
    { provide: ISupplierServiceKey, useClass: SupplierService}
  ],
  exports: [CustomerService, SupplierService, ICustomerServiceKey, ISupplierServiceKey, 'ISupplierRepository']
})
export class PartnersModule {}
