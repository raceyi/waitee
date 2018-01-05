import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the WalletPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})
export class WalletPage {
  search_mode="full";

  paymethods=[{name:"비자카드",type:"card"},
              {name:"마스터카드",type:"card"},
              {name:"휴대폰결제",tyep:"phone"}
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalletPage');
  }

  configureSearchMode(){
    if(this.search_mode=="full")
      this.search_mode="period";
    else
      this.search_mode="full";    
  }
}
