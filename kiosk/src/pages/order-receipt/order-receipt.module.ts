import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderReceiptPage } from './order-receipt';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    OrderReceiptPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(OrderReceiptPage),
  ],
})
export class OrderReceiptPageModule {}
