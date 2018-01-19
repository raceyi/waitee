import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashTutorialPage } from './cash-tutorial';

@NgModule({
  declarations: [
    CashTutorialPage,
  ],
  imports: [
    IonicPageModule.forChild(CashTutorialPage),
  ],
})
export class CashTutorialPageModule {}
