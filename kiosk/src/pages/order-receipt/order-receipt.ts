import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HomePage} from '../home/home';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the OrderReceiptPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-receipt',
  templateUrl: 'order-receipt.html',
})
export class OrderReceiptPage {
  orderNO;
  cardInfo;
  orderName;
  phone="";
  orderNotify;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storageProvider:StorageProvider) {

    console.log("storageProvider.shop:"+JSON.stringify(storageProvider.shop));

    this.orderNO=this.navParams.get("orderNO");
    this.cardInfo=this.navParams.get("cardInfo");
    this.orderName=this.navParams.get("orderName"); 
    this.orderNotify=this.navParams.get('orderNotify');   
    this.phone=this.navParams.get("phone");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderReceiptPage');
  }

  confirm(){
      this.navCtrl.setRoot(HomePage);  
  }
}
