import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SoldOutPage } from './sold-out';

@NgModule({
  declarations: [
    SoldOutPage,
  ],
  imports: [
    IonicPageModule.forChild(SoldOutPage),
  ],
})
export class SoldOutPageModule {}
