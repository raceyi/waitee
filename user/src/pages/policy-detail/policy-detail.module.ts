import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PolicyDetailPage } from './policy-detail';

@NgModule({
  declarations: [
    PolicyDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(PolicyDetailPage),
  ],
})
export class PolicyDetailPageModule {}
