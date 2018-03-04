import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderDetailPage } from './order-detail';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    OrderDetailPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(OrderDetailPage),
  ],
})
export class OrderDetailPageModule {}
