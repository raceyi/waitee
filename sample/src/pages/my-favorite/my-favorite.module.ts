import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFavoritePage } from './my-favorite';

@NgModule({
  declarations: [
    MyFavoritePage,
  ],
  imports: [
    IonicPageModule.forChild(MyFavoritePage),
  ],
})
export class MyFavoritePageModule {}
