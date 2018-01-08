import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashManualConfirmPage } from './cash-manual-confirm';

@NgModule({
  declarations: [
    CashManualConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(CashManualConfirmPage),
  ],
})
export class CashManualConfirmPageModule {}
