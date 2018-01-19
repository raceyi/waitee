import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {CashManualConfirmPage} from '../cash-manual-confirm/cash-manual-confirm';
import {StorageProvider} from '../../providers/storage/storage';
import {CashTutorialPage} from '../cash-tutorial/cash-tutorial';

declare var cordova:any;

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

  constructor(public navCtrl: NavController,
              private alertCtrl:AlertController, 
              public storageProvider:StorageProvider,
              public navParams: NavParams) {
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
    this.navCtrl.push(CashTutorialPage);
  }

  copyAccountInfo(){
    console.log("copyAccountInfo");
    var account = "3012424363621";
    cordova.plugins.clipboard.copy(account);
      let alert = this.alertCtrl.create({
          title: "계좌가 복사되었습니다",
          buttons: ['OK']
      });
      alert.present();
  }

}
