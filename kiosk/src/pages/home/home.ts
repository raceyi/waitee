import { Component } from '@angular/core';
import { NavController,Platform,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import {SearchPage} from '../search/search';
import{MenuListPage} from '../menu-list/menu-list';
import {MenuPage} from '../menu/menu';

declare var cordova:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  shop:any=[];
  categories:any=[];

  constructor(public navCtrl: NavController,
              public http: HttpClient,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              private alertCtrl:AlertController,
              private platform:Platform) {
      this.platform.ready().then(() => {
        if(platform.is("cordova")){
            cordova.plugins.WifiPrinter.listen((status)=>{
              console.log("status:"+status);
            })
        }
        this.getShopInfoAll(this.storageProvider.myshop.takitId);
           
      });
  }

  configureShopInfo(){
    // hum=> construct this.categoryRows
    this.shop.shopInfo.imagePath=this.storageProvider.awsS3+this.shop.shopInfo.imagePath;
    console.log("shop image: "+this.shop.shopInfo.imagePath);
    this.shop.categories.forEach(category => {
        let menus=[];
        //console.log("[configureShopInfo]this.shop:"+this.shop);
        this.shop.menus.forEach(menu=>{
            //console.log("menu.no:"+menu.menuNO+" index:"+menu.menuNO.indexOf(';'));
            let no:string=menu.menuNO.substr(menu.menuNO.indexOf(';')+1);
            //console.log("category.category_no:"+category.categoryNO+" no:"+no);
            if(no==category.categoryNO){
                menu.filename=encodeURI(this.storageProvider.awsS3+menu.imagePath);

                menu.categoryNO=no;
                //console.log("menu.filename:"+menu.filename);
                //menu.ngStyle={'background-image': 'url('+ menu.filename + ')'};
                let menu_name=menu.menuName.toString();
                //console.log("menu:"+JSON.stringify(menu));
                menus.push(menu);
            }
        });
        //console.log("menus:"+JSON.stringify(menus));
        if(!navigator.language.startsWith("ko") && category.categoryNameEn!=undefined && category.categoryNameEn!=null){
            //console.log("!ko && hasEn");
            this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryNameEn,menus:menus});
        }else // Korean
            this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryName,menus:menus});
        //console.log("[categories]:"+JSON.stringify(this.categories));    
    })

      console.log("[bestMenus]:"+JSON.stringify(this.shop.shopInfo.bestMenus));       

      if(this.shop.shopInfo.bestMenus!=null){
              this.shop.bestMenus=JSON.parse(this.shop.shopInfo.bestMenus); 
              let bestMenus=[];
              this.shop.bestMenus.forEach(menu=>{
                  var found = this.shop.menus.find(function(element) {
                                return (element.menuNO == menu.menuNO && element.menuName== menu.menuName);
                              });
                  bestMenus.push(found);            
              })
              this.shop.bestMenus=bestMenus;
      }
      console.log("[bestMenus]:"+JSON.stringify(this.shop.bestMenus));       
  }

    getShopInfoAll(takitId){
            let url="/cafe/shopHome";
            let body={takitId:takitId};
            console.log("getShopInfoAll:"+JSON.stringify(body));
            this.serverProvider.post(url,body).then((res:any)=>{   
                  console.log("response"+JSON.stringify(res));  
                  if(res.result=="success"){
                      this.shop=res;
                      this.configureShopInfo();
                      this.storageProvider.shop=this.shop;
                      this.storageProvider.categories=this.categories;
                      //console.log("this.shop.categories:"+)
                  }else{
                    let alert = this.alertCtrl.create({
                        title: "상점 정보를 가져오는데 실패했습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
                  } 
            },(err)=>{
                 console.log("post error "+JSON.stringify(err));
             });
    }

  post(){
    this.getShopInfoAll("TEST2@TAKIT");
  }

  connectPrinter(){
    cordova.plugins.WifiPrinter.connect("192.168.0.105",(result)=>{

    },err=>{

    })
  }

  print(){
    cordova.plugins.WifiPrinter.print("Wifi Printer,김치볶음밥 1",(result)=>{

    },err=>{
      
    })
  }
 
 selectCategory(categoryIndex){
    console.log("category:"+categoryIndex);
    this.navCtrl.push(MenuListPage,{class:"MenuListPage",categoryIndex:categoryIndex});  
 }

  search(){
    this.navCtrl.push(SearchPage,{class:"SearchPage"});
  }

  enterMenu(menu){
    this.navCtrl.push(MenuPage,{menu:menu,class:"MenuPage"});
  }

}
