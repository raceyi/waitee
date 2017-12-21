import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the CashPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-password',
  templateUrl: 'cash-password.html',
})
export class CashPasswordPage {
  passwordInput=['',' ',' ',' ',' ',' '];
  password=['1',' ',' ',' ',' ',' '];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashPasswordPage');
  }

  back(){
      this.navCtrl.pop();
  }
}
