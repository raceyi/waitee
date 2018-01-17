import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderListPage } from './order-list';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    OrderListPage,
  ],
  imports: [
    CustomIconsModule,
    IonicPageModule.forChild(OrderListPage),
  ],
})
export class OrderListPageModule {}
