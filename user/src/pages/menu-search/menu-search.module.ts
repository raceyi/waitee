import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuSearchPage } from './menu-search';

@NgModule({
  declarations: [
    MenuSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuSearchPage),
  ],
})
export class MenuSearchPageModule {}
