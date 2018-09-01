import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderListPage } from './order-list';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    OrderListPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(OrderListPage),
  ],
})
export class OrderListPageModule {}
