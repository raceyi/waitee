import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnMenuListPage } from './en-menu-list';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    EnMenuListPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EnMenuListPage),
  ],
})
export class EnMenuListPageModule {}
