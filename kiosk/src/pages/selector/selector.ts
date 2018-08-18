import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {HomePage} from '../home/home';

/**
 * Generated class for the SelectorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-selector',
  templateUrl: 'selector.html',
})
export class SelectorPage {

    takitId:string;
    shoplist=[];

  constructor(private navController: NavController, private navParams: NavParams,
                private storageProvider:StorageProvider){
           console.log("SelectorPage construtor:"+JSON.stringify(this.storageProvider.myshoplist));

           this.storageProvider.myshoplist.forEach((shop) => {
               this.shoplist.push(shop);
           });
           //this.shoplist=this.storageProvider.myshoplist;
  }

   ionViewDidEnter(){
        console.log("SelectorPage did enter");
  }

  selectShop(takitId){
      console.log("takitId:"+takitId);
      var shop;
      for(var i=0;i<this.shoplist.length;i++){
          if(this.shoplist[i].takitId==takitId){
              shop=this.shoplist[i];
              break;
          }
      }
      console.log("shop:"+JSON.stringify(shop));
      this.storageProvider.myshop=shop;
      this.navController.setRoot(HomePage);
  }

}
