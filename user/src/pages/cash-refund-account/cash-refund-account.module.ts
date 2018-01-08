import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashRefundAccountPage } from './cash-refund-account';

@NgModule({
  declarations: [
    CashRefundAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(CashRefundAccountPage),
  ],
})
export class CashRefundAccountPageModule {}
