import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShopPage } from './shop';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    ShopPage,
  ],
  imports: [
    CustomIconsModule,
    IonicPageModule.forChild(ShopPage),
  ],
})
export class ShopPageModule {}
