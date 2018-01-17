import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFavoritePage } from './my-favorite';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    MyFavoritePage,
  ],
  imports: [
    CustomIconsModule,
    IonicPageModule.forChild(MyFavoritePage),
  ],
})
export class MyFavoritePageModule {}
