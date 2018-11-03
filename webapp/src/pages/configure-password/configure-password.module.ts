import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfigurePasswordPage } from './configure-password';

@NgModule({
  declarations: [
    ConfigurePasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfigurePasswordPage),
  ],
})
export class ConfigurePasswordPageModule {}
