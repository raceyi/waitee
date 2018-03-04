import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashRefundMainPage } from './cash-refund-main';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    CashRefundMainPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CashRefundMainPage),
  ],
})
export class CashRefundMainPageModule {}
