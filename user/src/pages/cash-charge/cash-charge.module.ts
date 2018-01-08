import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashChargePage } from './cash-charge';

@NgModule({
  declarations: [
    CashChargePage,
  ],
  imports: [
    IonicPageModule.forChild(CashChargePage),
  ],
})
export class CashChargePageModule {}
