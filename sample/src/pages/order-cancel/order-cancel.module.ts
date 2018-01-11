import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderCancelPage } from './order-cancel';

@NgModule({
  declarations: [
    OrderCancelPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderCancelPage),
  ],
})
export class OrderCancelPageModule {}
