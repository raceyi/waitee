import { Component } from '@angular/core';
import { NavController,App } from 'ionic-angular';
import { ShopPage} from '../shop/shop';
import {SearchPage} from '../search/search';
import { StorageProvider } from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

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
              ,public serverProvider:ServerProvider) {
  
    this.recently_visited_shop=[{takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            classification:"한식",
                            star_rating:4.8},
                            {takitId:"그릿스테이크@서울창업허브",
                            name_sub:"서울창업허브",
                            name_main:"그릿 스테이크",
                            classification:"양식",
                            star_rating:4.8},
                            {takitId:"더큰도시락@세종대학교",
                            name_sub:"세종대학교",
                            name_main:"더큰도시락",
                            classification:"한식",
                            star_rating:4.8},
                            {takitId:"그릿스테이크@서울창업허브",
                            name_sub:"서울창업허브",
                            name_main:"그릿 스테이크",
                            classification:"양식",
                            star_rating:4.8} ];     
    //Just for testing                                               
    this.recently_visited_shop.forEach(shop => {
      shop.imagePath=this.awsS3+"shop.png";
    });                                
  }

/*
  getShops(ev:any){
    let val = ev.target.value;
    if (val && val.trim() != '') {
        this.shops = this.shops.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
*/

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
}
