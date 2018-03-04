import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashCancelChargePage } from './cash-cancel-charge';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    CashCancelChargePage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CashCancelChargePage),
  ],
})
export class CashCancelChargePageModule {}
