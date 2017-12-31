import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {PolicyDetailPage} from '../policy-detail/policy-detail';
/**
/**
 * Generated class for the PolicyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-policy',
  templateUrl: 'policy.html',
})
export class PolicyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PolicyPage');
  }

  back(){
    this.navCtrl.pop();
  }

  goToPictureInfo(){
     this.navCtrl.push(PolicyDetailPage,{kind:5});
  }

  goToLocationInfo(){
     this.navCtrl.push(PolicyDetailPage,{kind:4});
  }

  goToTransaction(){
     this.navCtrl.push(PolicyDetailPage,{kind:3});
  }

  goToPersonalInfo(){
     this.navCtrl.push(PolicyDetailPage,{kind:2});
  }

  goToUserAgreement(){
     this.navCtrl.push(PolicyDetailPage,{kind:1});
  }
}
