import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , App,Events,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {CartPage} from '../cart/cart';
import {ServerProvider} from '../../providers/server/server';
import { ShopPage} from '../shop/shop';
import {MenuPage} from '../menu/menu';

/**
 * Generated class for the MyFavoritePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-favorite',
  templateUrl: 'my-favorite.html',
})
export class MyFavoritePage {
  shops=[];
  menus=[];
  pageSelected:boolean=false;

  constructor(public navCtrl: NavController, 
              public storageProvider:StorageProvider,
              public navParams: NavParams,
              private alertCtrl:AlertController,
              private serverProvider:ServerProvider,
              private events:Events,                            
              public app:App) {
                
    events.subscribe('orderUpdate', (param) =>{
        this.getInfos();        
    });
    this.getInfos();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyFavoritePage');
  }

  ionViewWillEnter(){
     console.log("ionViewWillEnter MyFavoritePage");


  }

  openCart(){
      this.app.getRootNav().push( CartPage,{class:"CartPage"});
  }

  enterShop(takitId){
         if(!this.pageSelected){
            this.pageSelected=true;
            console.log("this.shopSelected true");
            setTimeout(() => {
                console.log("reset shopSelected:"+this.pageSelected);
                this.pageSelected=false;
            }, 1000); //  seconds     
            this.serverProvider.getShopInfo(takitId).then((res:any)=>{
                this.storageProvider.shopResponse=res;
                console.log("this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));
                this.app.getRootNavs()[0].push(ShopPage,{takitId:takitId});
            },(err)=>{
                console.log("error:"+JSON.stringify(err));
                 this.pageSelected=false;
                  let alert = this.alertCtrl.create({
                      title: "서버와 통신에 문제가 있습니다.",
                      buttons: ['OK']
                  });
                  alert.present();
            });
        }else{
            console.log("this.shopSelected works!");
        }
  }  

  selectMenu(menu){
    if(this.pageSelected)
        return;

    this.pageSelected=true;
    setTimeout(() => {
        console.log("reset orderPageEntered:"+this.pageSelected);
        this.pageSelected=false;
    }, 1000); //  seconds  

    this.serverProvider.getShopInfo(menu.takitId).then((res:any)=>{
        //this.storageProvider.shopResponse=res;
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
        console.log("error:"+JSON.stringify(err));
          this.pageSelected=false;
          let alert = this.alertCtrl.create({
              title: "서버와 통신에 문제가 있습니다.",
              buttons: ['OK']
          });
          alert.present();
    });

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
              let alert = this.alertCtrl.create({
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
              let alert = this.alertCtrl.create({
                  title: "즐겨 찾는 음식점 정보를 가져오지 못했습니다.",
                  buttons: ['OK']
              });
              alert.present();
          }
      });

  }
  
  exitTourMode(){
    console.log("exit Tour Mode");
    this.app.getRootNav().pop();
  }

  
}
