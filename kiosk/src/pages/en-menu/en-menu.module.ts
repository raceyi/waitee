import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnMenuPage } from './en-menu';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    EnMenuPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EnMenuPage),
  ],
})
export class EnMenuPageModule {}
