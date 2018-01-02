import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashRefundMainPage } from './cash-refund-main';

@NgModule({
  declarations: [
    CashRefundMainPage,
  ],
  imports: [
    IonicPageModule.forChild(CashRefundMainPage),
  ],
})
export class CashRefundMainPageModule {}
