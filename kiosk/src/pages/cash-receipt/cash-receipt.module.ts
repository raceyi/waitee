import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashReceiptPage } from './cash-receipt';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    CashReceiptPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CashReceiptPage),
  ],
})
export class CashReceiptPageModule {}
