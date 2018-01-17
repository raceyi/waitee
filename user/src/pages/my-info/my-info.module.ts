import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyInfoPage } from './my-info';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    MyInfoPage,
  ],
  imports: [
    CustomIconsModule,
    IonicPageModule.forChild(MyInfoPage),
  ],
})
export class MyInfoPageModule {}
