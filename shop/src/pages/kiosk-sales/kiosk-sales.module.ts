import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { KioskSalesPage } from './kiosk-sales';

@NgModule({
  declarations: [
    KioskSalesPage,
  ],
  imports: [
    IonicPageModule.forChild(KioskSalesPage),
  ],
})
export class KioskSalesPageModule {}
