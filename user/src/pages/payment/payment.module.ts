import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentPage } from './payment';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    PaymentPage,
  ],
  imports: [
    CustomIconsModule,
    IonicPageModule.forChild(PaymentPage),
  ],
})
export class PaymentPageModule {}
