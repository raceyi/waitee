import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPaymentPage } from './signup-payment';

@NgModule({
  declarations: [
    SignupPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(SignupPaymentPage),
  ],
})
export class SignupPaymentPageModule {}
