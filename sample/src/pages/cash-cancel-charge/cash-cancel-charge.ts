import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the CashCancelChargePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-cancel-charge',
  templateUrl: 'cash-cancel-charge.html',
})
export class CashCancelChargePage {
  custom;

  cashId="TAKIT"
  amount="10000";
  dayOfWeek="월요일"; //"월요일,화요일,수요일,..."
  timeString:string="2017.11.13 월요일 22:30:15";
  bank="농협은행";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
     let custom = {"cashTuno":"20170103075617278","cashId":"TAKIT02","transactionType":"deposit","amount":1,"transactionTime":"20170103","confirm":0,"bankName":"농협은행"}
    // let custom ={"depositMemo":"타킷 주식회사","amount":"100003","depositDate":"2017-01-06","branchName":"본점영업부","cashTuno":"20170106093158510","bankName":"농협"}

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CashCancelChargePage');
  }

}
