import { Component } from '@angular/core';
import { NavController,App,AlertController ,Events,LoadingController} from 'ionic-angular';
import { ShopPage} from '../shop/shop';
import {SearchPage} from '../search/search';
import { StorageProvider } from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {CartPage} from '../cart/cart';
import {MenuPage} from '../menu/menu';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  recently_visited_shop=[];
  awsS3:string="assets/imgs/";

  menus=[];
  shops=[];

  //shopSelected:boolean=false;

  constructor(public navCtrl: NavController,private app: App
              ,public storageProvider:StorageProvider
              ,private alertController:AlertController 
              ,public loadingCtrl: LoadingController                                          
              ,private events:Events                                                       
              ,public serverProvider:ServerProvider) {
/*
    this.storageProvider.messageEmitter.subscribe((param)=>{ 
        console.log("messageEmitter comes");
        this.navCtrl.parent.select(2);        
    });
*/

    events.subscribe('orderUpdate', (param) =>{
        this.getInfos();        
    });
    
 }

 ionViewWillEnter(){
     console.log("ionViewWillEnter MyFavoritePage");
     this.getInfos();
  }

  getInfos(){
       let body = {};
       this.serverProvider.post(this.storageProvider.serverAddress+"/getFavoriteMenu",body).then((res:any)=>{
          console.log("getFavoriteMenu res:"+JSON.stringify(res));
          if(res.result=="success"){
              this.menus=res.menus;
              this.menus.forEach(menu => {
                let strs=menu.takitId.split("@");
                menu.name_sub = strs[0];
                menu.name_main= strs[1];
                menu.fullImagePath=this.storageProvider.awsS3+menu.imagePath;
              });       
              
          }else{
              let alert = this.alertController.create({
                  title: "즐겨 찾는 메뉴 정보를 가져오지 못했습니다.",
                  buttons: ['OK']
              });
              alert.present();
          }
      });
       this.serverProvider.post(this.storageProvider.serverAddress+"/getFavoriteShops",body).then((res:any)=>{
          console.log("getFavoriteShops res:"+JSON.stringify(res));
          if(res.result=="success"){
              this.shops=res.shopInfos;
              this.shops.forEach(shop=>{
                let strs=shop.takitId.split("@");
                shop.name_sub = strs[0];
                shop.name_main= strs[1];
                shop.imagePath= this.storageProvider.awsS3+shop.imagePath;
              })
          }else{
              let alert = this.alertController.create({
                  title: "즐겨 찾는 음식점 정보를 가져오지 못했습니다.",
                  buttons: ['OK']
              });
              alert.present();
          }
      });
  }

  selectMenu(menu){
            let progressBarLoader = this.loadingCtrl.create({
                content: "진행중입니다.",
                duration: 30*1000 //30 seconds
            });
            progressBarLoader.present();
    this.serverProvider.getShopInfo(menu.takitId).then((res:any)=>{
            progressBarLoader.dismiss();
            console.log("this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));

            let shopInfo={takitId:menu.takitId, 
                        address:res.shopInfo.address, 
                        shopName:res.shopInfo.shopName,
                        deliveryArea:res.shopInfo.deliveryArea,
                        freeDelivery:res.shopInfo.freeDelivery,
                        paymethod:res.shopInfo.paymethod,
                        deliveryFee:res.shopInfo.deliveryFee};

            this.app.getRootNavs()[0].push(MenuPage, {menu:JSON.stringify(menu),
                                        shopInfo:JSON.stringify(shopInfo),
                                        class:"MenuPage"});
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
//////////////////////////////////////////////////////////////////////////
  showSearchBar(){
      this.app.getRootNavs()[0].push(SearchPage);
  }

  enterShop(takitId){
            let progressBarLoader = this.loadingCtrl.create({
                content: "진행중입니다.",
                duration: 30*1000 //30 seconds
            });
            progressBarLoader.present();
            this.serverProvider.getShopInfo(takitId).then((res:any)=>{
                progressBarLoader.dismiss();                        
                this.storageProvider.shopResponse=res;
                console.log("this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));
                this.app.getRootNavs()[0].push(ShopPage,{takitId:takitId});
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

  buttonPressed(){
    console.log("buttonPressed");  
  }

  exitTourMode(){
    console.log("exit Tour Mode");
    this.app.getRootNav().pop();
  }

  openCart(){
      this.app.getRootNav().push( CartPage,{class:"CartPage"});
  }
}
