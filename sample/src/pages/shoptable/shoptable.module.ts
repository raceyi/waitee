import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoptablePage } from './shoptable';

@NgModule({
  declarations: [
    ShoptablePage,
  ],
  imports: [
    IonicPageModule.forChild(ShoptablePage),
  ],
})
export class ShoptablePageModule {}
