import { Component ,ViewChild} from '@angular/core';
import { NavController,Platform,AlertController,ViewController,Content,IonicApp,App,MenuController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { HttpClient ,HttpHeaders} from '@angular/common/http';
import {SearchPage} from '../search/search';
import{MenuListPage} from '../menu-list/menu-list';
import {OrderListPage} from '../order-list/order-list';
import {MenuPage} from '../menu/menu';
import { CartProvider } from '../../providers/cart/cart';
import {OrderCheckPage} from '../order-check/order-check';
import {ConfigurationPage} from '../configuration/configuration';

declare var cordova:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  shop:any=[];
  categories:any=[];
  configurePassword;
  @ViewChild("homeContent") public contentRef: Content;

  constructor(public navCtrl: NavController,
              public http: HttpClient,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              private alertCtrl:AlertController,
              public cartProvider:CartProvider,
              private ionicApp: IonicApp,
              private app:App,
              public viewCtrl: ViewController,              
              private menuCtrl: MenuController,              
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

  ionViewDidLoad() {
      ///////////////////////////////////////////////////////////  
            let ready = true;          
            this.platform.registerBackButtonAction(()=>{
                console.log("Back button action called");

                let activePortal = this.ionicApp._loadingPortal.getActive() ||
                this.ionicApp._modalPortal.getActive() ||
                this.ionicApp._toastPortal.getActive() ||
                this.ionicApp._overlayPortal.getActive();

                if (activePortal) {
                    ready = false;
                    activePortal.dismiss();
                    activePortal.onDidDismiss(() => { ready = true; });

                    console.log("handled with portal");
                    return;
                }

                if (this.menuCtrl.isOpen()) {
                    this.menuCtrl.close();

                    console.log("closing menu");
                    return;
                }

                let view = this.navCtrl.getActive(); // As none of the above have occurred, its either a page pushed from menu or tab
                let activeVC = this.navCtrl.getActive(); //get the active view
            
                let page = activeVC.instance; //page is the current view's instance i.e the current component I suppose
                if(this.app.getRootNav().getActive()!=this.viewCtrl){                
                        if (this.navCtrl.canGoBack() || view && view.isOverlay) {
                            this.navCtrl.pop(); //pop if page can go back or if its an overlay over a menu page
                        }             
                        else {
                                console.log("No view in app. How can it happen?");
                                this.platform.exitApp();
                        }
                        return;
                }else{
                    console.log("Handling back button on  tabs page");
                }
            }, 100/* high priority rather than login page */);
      /////////////////////////////////////////////////////////// 
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
                      this.storageProvider.takitId=takitId;
                      console.log("this.storageProvider.shop.businessNumber:"+this.storageProvider.shop.businessNumber);
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
    //console.log("[homePage] menu:"+JSON.stringify(menu));
    this.navCtrl.push(MenuPage,{menu:menu,class:"MenuPage"});
  }

  orderDetail(){
    console.log("orderDetail comes");
    // 주문번호로 주문을 확인하고 취소할수 있도록 한다.
    // 날짜와 주문번호를 선택하게 한다.  
  }

  moveOrderList(){
    this.navCtrl.push(OrderListPage,{class:"OrderListPage"});
  }

  orderCheck(){
    this.navCtrl.push(OrderCheckPage,{class:"OrderCheckPage"});
  }


  configuration(){

let alert = this.alertCtrl.create({
    title: '환경설정',
    inputs: [
      {
        name: '비밀번호(4자리)',
        placeholder: '비밀번호',
        type: 'number'
      }
    ],
    buttons: [
      {
        text: '취소',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: '확인',
        handler: data => {
          console.log("data:"+data["비밀번호(4자리)"]);
          if (data["비밀번호(4자리)"]==this.storageProvider.configurePassword) {
                this.navCtrl.push(ConfigurationPage,{class:"ConfigurationPag"});
          } else {
            // invalid value
            return false;
          }
        }
      }
    ]
  });
  alert.present();
}

  resetCart(){
    this.cartProvider.resetCart().then(()=>{
        this.contentRef.resize();
    });
  }
}
