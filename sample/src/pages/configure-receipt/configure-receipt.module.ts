import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfigureReceiptPage } from './configure-receipt';

@NgModule({
  declarations: [
    ConfigureReceiptPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfigureReceiptPage),
  ],
})
export class ConfigureReceiptPageModule {}
