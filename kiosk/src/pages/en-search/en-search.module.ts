import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnSearchPage } from './en-search';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    EnSearchPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EnSearchPage),
  ],
})
export class EnSearchPageModule {}
