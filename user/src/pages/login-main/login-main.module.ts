import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginMainPage } from './login-main';
import { CustomIconsModule } from 'ionic2-custom-icons';

@NgModule({
  declarations: [
    LoginMainPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginMainPage),
    CustomIconsModule
  ],
})
export class LoginMainPageModule {}
