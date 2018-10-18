import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnOrderCheckPage } from './en-order-check';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    EnOrderCheckPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EnOrderCheckPage),
  ],
})
export class EnOrderCheckPageModule {}
