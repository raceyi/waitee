import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App,AlertController,Platform} from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';
import { ShopPage} from '../shop/shop';

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
  shops=[];
  visited=[];
  shopSelected:boolean=false;

  constructor(public navCtrl: NavController,
              private nativeStorage:NativeStorage,
              private platform:Platform,
              private storageProvider:StorageProvider,
              private serverProvider:ServerProvider, 
              private alertCtrl:AlertController,
              private app:App,
              public navParams: NavParams) {

    platform.ready().then(() => {
      this.nativeStorage.getItem("searchList").then((value)=>{
          this.visited=JSON.parse(value);
      },(err)=>{
          console.log("fail to read searchList from nativeStorage");
          this.visited=[];
      });
    })  
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchPage');
  }

  onInput(ev){
    let val = ev.target.value;
   // console.log("val:"+val);
    if(val!=undefined && val.length==1){
        let body = {keyword:val}
        console.log("searchShop");
        this.serverProvider.post(this.storageProvider.serverAddress+"/searchShop",body).then((res:any)=>{
            console.log("res:"+JSON.stringify(res.shopInfo));
            this.shops=[];
            res.shopInfo.forEach(shop=>{
                console.log("shop.takitId:"+shop.takitId);
                let strs=shop.takitId.split("@");
                this.shops.push(strs[0]+" "+strs[1]);
            });
        },err=>{
            let alert = this.alertCtrl.create({
                        title: "서버로 부터 응답을 받지 못했습니다.",
                        subTitle:"네크웍상태를 확인해 주시기 바랍니다.",
                        buttons: ['OK']
                    });
                    alert.present();
        })
    }

    if (val && val.trim() !== '' && this.shops.length>0) {
      this.shops = this.shops.filter(function(shop) {
        return shop.toLowerCase().includes(val.toLowerCase());
      });
    }

  }

  goToShop(shop){
    let strs=shop.split(' ');
    let takitId=strs[0]+'@'+strs[1];
    console.log("takitId:"+takitId);

          if(!this.shopSelected){
            this.shopSelected=true;
            console.log("this.shopSelected true");
            setTimeout(() => {
                console.log("reset shopSelected:"+this.shopSelected);
                this.shopSelected=false;
            }, 1000); //  seconds     
            this.serverProvider.getShopInfo(takitId).then((res:any)=>{
                this.storageProvider.shopResponse=res;
                this.pushVisited(shop);
                //나중에 서버에 저장하자.
                this.nativeStorage.setItem("searchList",JSON.stringify(this.visited));
                console.log("this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));
                this.app.getRootNavs()[0].push(ShopPage,{takitId:takitId});                
            },(err)=>{
                console.log("error:"+JSON.stringify(err));
                 this.shopSelected=false;
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

  pushVisited(shop){
     let index=this.visited.indexOf(shop);
     if(index>=0){
       this.visited.splice(index,1);
     }
     let shops=[shop];
     this.visited=this.visited=shops.concat(this.visited);
     if(this.visited.length>5){
       this.visited.splice(5,this.visited.length-5);
     }
     console.log("visited:"+JSON.stringify(this.visited));
  }

  back(){
    this.navCtrl.pop();
  }
}
