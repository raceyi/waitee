import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashConfirmPage } from './cash-confirm';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    CashConfirmPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CashConfirmPage),
  ],
})
export class CashConfirmPageModule {}
