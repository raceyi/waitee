import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

  }

  goToLocationInfo(){

  }

  goToTransaction(){

  }

  goToPersonalInfo(){

  }

  goToUserAgreement(){
    
  }
}
