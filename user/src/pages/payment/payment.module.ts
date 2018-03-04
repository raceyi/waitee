import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentPage } from './payment';
import { CustomIconsModule } from 'ionic2-custom-icons';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    PaymentPage,
  ],
  imports: [
    CustomIconsModule,
    ComponentsModule,
    IonicPageModule.forChild(PaymentPage),
  ],
})
export class PaymentPageModule {}
