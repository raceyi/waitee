import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderListPage } from './order-list';
import { CustomIconsModule } from 'ionic2-custom-icons';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    OrderListPage,
  ],
  imports: [
    CustomIconsModule,
    ComponentsModule,
    IonicPageModule.forChild(OrderListPage),
  ],
})
export class OrderListPageModule {}
