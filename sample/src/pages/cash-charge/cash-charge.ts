import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CashManualConfirmPage} from '../cash-manual-confirm/cash-manual-confirm';

/**
 * Generated class for the CashChargePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-charge',
  templateUrl: 'cash-charge.html',
})
export class CashChargePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashChargePage');
  }

  back(){
    this.navCtrl.pop();
  }

  manualCheck(){
    console.log("manualCheck");
    this.navCtrl.push(CashManualConfirmPage);
  }

  moveTutorial(){
    
  }
}
