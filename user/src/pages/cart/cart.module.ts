import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CartPage } from './cart';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    CartPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CartPage),
  ],
})
export class CartPageModule {}
