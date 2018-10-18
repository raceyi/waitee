import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnOrderListPage } from './en-order-list';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    EnOrderListPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EnOrderListPage),
  ],
})
export class EnOrderListPageModule {}
