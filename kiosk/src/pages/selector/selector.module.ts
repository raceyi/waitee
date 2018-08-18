import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectorPage } from './selector';

@NgModule({
  declarations: [
    SelectorPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectorPage),
  ],
})
export class SelectorPageModule {}
