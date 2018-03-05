import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController } from 'ionic-angular';

/**
 * Generated class for the ShopInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shop-info',
  templateUrl: 'shop-info.html',
})
export class ShopInfoPage {
  foodOrigin:string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public alertCtrl:AlertController) {

  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad ShopInfoPage');
  }

  saveShopInfo(){
      console.log("saveShopInfo");
      if(!this.foodOrigin){
          let alert = this.alertCtrl.create({
                title: '원산지표시가 없습니다.',
                buttons: ['OK']
              });
              alert.present();
      }
  }
}
