import { Component } from '@angular/core';
import { NavController,App,AlertController } from 'ionic-angular';
import { ShopPage} from '../shop/shop';
import {SearchPage} from '../search/search';
import { StorageProvider } from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {CartPage} from '../cart/cart';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  recently_visited_shop=[];
  awsS3:string="assets/imgs/";
  //shops=[];
  //overlayHidden:boolean=true;
  //searchShop:string=" ";
  //shouldShowCancel:boolean=true;
  shopSelected:boolean=false;

  constructor(public navCtrl: NavController,private app: App
              ,public storageProvider:StorageProvider
              ,private alertController:AlertController              
              ,public serverProvider:ServerProvider) {
/*
    this.storageProvider.messageEmitter.subscribe((param)=>{ 
        console.log("messageEmitter comes");
        this.navCtrl.parent.select(2);        
    });
*/    
 }

  showSearchBar(){
      this.navCtrl.push(SearchPage);
  }

  enterShop(takitId){
         if(!this.shopSelected){
            this.shopSelected=true;
            console.log("this.shopSelected true");
            setTimeout(() => {
                console.log("reset shopSelected:"+this.shopSelected);
                this.shopSelected=false;
            }, 1000); //  seconds     
            this.serverProvider.getShopInfo(takitId).then((res:any)=>{
                this.storageProvider.shopResponse=res;
                console.log("this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));
                this.app.getRootNavs()[0].push(ShopPage,{takitId:takitId});
            },(err)=>{
                console.log("error:"+JSON.stringify(err));
                 this.shopSelected=false;
                  let alert = this.alertController.create({
                      title: "서버와 통신에 문제가 있습니다.",
                      buttons: ['OK']
                  });
                  alert.present();
            });
        }else{
            console.log("this.shopSelected works!");
        }
  }  

  buttonPressed(){
    console.log("buttonPressed");  
  }

  exitTourMode(){
    console.log("exit Tour Mode");
  }

  openCart(){
      this.app.getRootNav().push( CartPage,{class:"CartPage"});
  }
}
