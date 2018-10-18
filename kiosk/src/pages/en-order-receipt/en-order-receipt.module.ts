import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnOrderReceiptPage } from './en-order-receipt';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    EnOrderReceiptPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EnOrderReceiptPage),
  ],
})
export class EnOrderReceiptPageModule {}
