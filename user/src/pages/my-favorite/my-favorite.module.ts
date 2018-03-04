import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyFavoritePage } from './my-favorite';
import { CustomIconsModule } from 'ionic2-custom-icons';
import {ComponentsModule} from '../../components/components.module';

@NgModule({
  declarations: [
    MyFavoritePage,
  ],
  imports: [
    CustomIconsModule,
    ComponentsModule,
    IonicPageModule.forChild(MyFavoritePage),
  ],
})
export class MyFavoritePageModule {}
