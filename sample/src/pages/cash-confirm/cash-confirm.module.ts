import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashConfirmPage } from './cash-confirm';

@NgModule({
  declarations: [
    CashConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(CashConfirmPage),
  ],
})
export class CashConfirmPageModule {}
