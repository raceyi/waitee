import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StoreSearchPage } from './store-search';

@NgModule({
  declarations: [
    StoreSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(StoreSearchPage),
  ],
})
export class StoreSearchPageModule {}
