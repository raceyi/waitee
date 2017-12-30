import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
  shops=["할랄투고 서울창업허브",
         "마이웨이퀴진 서울창업허브",
         "그릴스테이크 서울창업허브",
         "미스꼬레아 서울창업허브"];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  setShops(){
      this.shops=["할랄투고 서울창업허브",
                  "마이웨이퀴진 서울창업허브",
                  "그릴스테이크 서울창업허브",
                  "미스꼬레아 서울창업허브"];
  }

  onInput(ev){
    this.setShops();
    let val = ev.target.value;

    if (val && val.trim() !== '') {
      this.shops = this.shops.filter(function(shop) {
        return shop.toLowerCase().includes(val.toLowerCase());
      });
    }

  }

  goToShop(shop){

  }

  back(){
    this.navCtrl.pop();
  }
}
