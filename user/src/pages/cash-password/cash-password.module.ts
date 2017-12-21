import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashPasswordPage } from './cash-password';

@NgModule({
  declarations: [
    CashPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(CashPasswordPage),
  ],
})
export class CashPasswordPageModule {}
