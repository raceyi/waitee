import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderReceiptPage } from './order-receipt';

@NgModule({
  declarations: [
    OrderReceiptPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderReceiptPage),
  ],
})
export class OrderReceiptPageModule {}
