import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletPage } from './wallet';
import { CustomIconsModule } from 'ionic2-custom-icons';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    WalletPage,
  ],
  imports: [
    CustomIconsModule,
    ComponentsModule,
    IonicPageModule.forChild(WalletPage),
  ],
})
export class WalletPageModule {}
