import {Component} from "@angular/core";
//import {Platform} from 'ionic-angular';
import {NavController,NavParams} from 'ionic-angular';
//import {MyApp} from '../../app';
import{ShopTablePage} from '../shoptable/shoptable';
//import {ErrorPage} from '../error/error';

import {StorageProvider} from '../../providers/storageProvider';

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
      this.navController.setRoot(ShopTablePage);
  }
 
}
