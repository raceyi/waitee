import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoptablePage } from './shoptable';
import {ComponentsModule} from '../../components/components.module';
import {CustomIconsModule} from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    ShoptablePage,
  ],
  imports: [
    ComponentsModule,
    CustomIconsModule,
    IonicPageModule.forChild(ShoptablePage),
  ],
})
export class ShoptablePageModule {}
