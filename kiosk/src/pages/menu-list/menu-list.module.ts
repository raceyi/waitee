import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuListPage } from './menu-list';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    MenuListPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(MenuListPage),
  ],
})
export class MenuListPageModule {}
