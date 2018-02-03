import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfigurePaymentPage } from './configure-payment';

@NgModule({
  declarations: [
    ConfigurePaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfigurePaymentPage),
  ],
})
export class ConfigurePaymentPageModule {}
