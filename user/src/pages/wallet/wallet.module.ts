import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletPage } from './wallet';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    WalletPage,
  ],
  imports: [
    CustomIconsModule,
    IonicPageModule.forChild(WalletPage),
  ],
})
export class WalletPageModule {}
