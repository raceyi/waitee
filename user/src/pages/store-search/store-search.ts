import { Component } from '@angular/core';
import { IonicPage, App,NavController, NavParams ,AlertController,LoadingController} from 'ionic-angular';
import {SearchPage} from '../search/search';
import { StorageProvider } from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { ShopPage} from '../shop/shop';

/**
 * Generated class for the StoreSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-store-search',
  templateUrl: 'store-search.html',
})
export class StoreSearchPage {

  constructor(public navCtrl: NavController,
              private app: App, 
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              private alertController:AlertController,              
              public loadingCtrl: LoadingController,                                                        
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StoreSearchPage');
  }

  showSearchBar(){
      this.app.getRootNavs()[0].push(SearchPage);
  }

enterShop(shop){
  if(shop.ready!=0){
            let progressBarLoader = this.loadingCtrl.create({
                content: "진행중입니다.",
                duration: 30*1000 //30 seconds
            });
            progressBarLoader.present();
            this.serverProvider.getShopInfo(shop.takitId).then((res:any)=>{
                progressBarLoader.dismiss();                        
                this.storageProvider.shopResponse=res;
                console.log("this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));
                this.app.getRootNavs()[0].push(ShopPage,{takitId:shop.takitId});
            },(err)=>{
                progressBarLoader.dismiss();                        
                console.log("error:"+JSON.stringify(err));
                  let alert = this.alertController.create({
                      title: "서버와 통신에 문제가 있습니다.",
                      buttons: ['OK']
                  });
                  alert.present();
            });
  }
}

}
