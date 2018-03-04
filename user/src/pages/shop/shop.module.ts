import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShopPage } from './shop';
import { CustomIconsModule } from 'ionic2-custom-icons';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    ShopPage,
  ],
  imports: [
    CustomIconsModule,
    ComponentsModule,
    IonicPageModule.forChild(ShopPage),
  ],
})
export class ShopPageModule {}
