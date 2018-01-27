import { Component ,ViewChild} from '@angular/core';
import { IonicPage, NavController, Content,NavParams,AlertController ,App} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {MenuPage} from '../menu/menu';
import {TabsPage} from '../tabs/tabs';
import {ServerProvider} from '../../providers/server/server';
import {CartPage} from '../cart/cart';

/**
 * Generated class for the ShopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html',
})
export class ShopPage {
  shop;
  shopName;
  takitId;
  orderPageEntered:boolean=false;
  nowMenus=[];
  @ViewChild('shophomeContent') shophomeContentRef:Content;
  takeout;
  shopPhoneHref;
  categorySelected=0;
  categories;
  menus=[];
  shopInfo:any;
  regularOff;
  ngStyle;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public serverProvider:ServerProvider,private app:App,
              private alertCtrl:AlertController,public storageProvider:StorageProvider) {

      console.log("ShopPage");
      this.storageProvider.takitId=navParams.get("takitId");
      this.takitId==navParams.get("takitId");
      this.shop=this.storageProvider.shopResponse;
      console.log("businessTime: ."+ this.shop.shopInfo.businessTime);

      this.shop.shopInfo.businessTimesObj=JSON.parse(this.shop.shopInfo.businessTime);

      var date=new Date();
      this.shop.shopInfo.TodayBusinessTime=this.shop.shopInfo.businessTimesObj[date.getDay()];
      console.log("TodayBusinessTime:.."+this.shop.shopInfo.TodayBusinessTime);
      this.regularOff="";
      for(var index=0;index<this.shop.shopInfo.businessTimesObj.length;index++){
          let strs:string=this.shop.shopInfo.businessTimesObj[index].split("~");
          if(strs[0]==strs[1]){
              this.regularOff+=" "+this.getDayString(index);
          }
      }
      if(typeof storageProvider.shopResponse.shopInfo.paymethod ==="string")
        storageProvider.shopResponse.shopInfo.paymethod=JSON.parse(storageProvider.shopResponse.shopInfo.paymethod);
      console.log("paymethod:"+ storageProvider.shopResponse.shopInfo.paymethod.card);
      console.log("paymethod:"+ storageProvider.shopResponse.shopInfo.paymethod.cash);
      this.ngStyle={'background-image': 'url('+ storageProvider.awsS3+storageProvider.shopResponse.shopInfo.imagePath + ')'};
  }

  getDayString(i){
    if(i==0){
      return "일요일";
    }else if(i==1){
      return "월요일";
    }else if(i==2){
      return "화요일";
    }else if(i==3){
      return "수요일";
    }else if(i==4){
      return "목요일";
    }else if(i==5){
      return "금요일";
    }else if(i==6){
      return "토요일";
    }
  }

  ionViewWillEnter(){ 
        console.log("ionViewWillEnter");
        if(this.takitId==undefined){
          this.takitId=this.storageProvider.takitId;
          this.loadShopInfo();
          this.shophomeContentRef.resize();
        }
        this.orderPageEntered=false;
        //this.businessType=this.shop.shopInfo.businessType;

        if(this.storageProvider.shopInfo.takeout){
            this.takeout=parseInt(this.storageProvider.shopInfo.takeout);

        }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
  }

  configureButtonColor(i){
     if(i==this.categorySelected)
          return '#6441a5';
      else
          return '#bdbdbd';    
  }

  back(){
    if(this.navCtrl.canGoBack())
        this.navCtrl.pop();
    else
        this.navCtrl.setRoot(TabsPage);
  }

  configureShopInfo(){
    // hum=> construct this.categoryRows
    this.shop.categories.forEach(category => {
        let menus=[];
        console.log("[configureShopInfo]this.shop:"+this.shop);
        this.shop.menus.forEach(menu=>{
            //console.log("menu.no:"+menu.menuNO+" index:"+menu.menuNO.indexOf(';'));
            let no:string=menu.menuNO.substr(menu.menuNO.indexOf(';')+1);
            //console.log("category.category_no:"+category.categoryNO+" no:"+no);
            if(no==category.categoryNO){
                menu.filename=encodeURI(this.storageProvider.awsS3+menu.imagePath);
                menu.categoryNO=no;
                //console.log("menu.filename:"+menu.filename);
                let menu_name=menu.menuName.toString();
                //console.log("menu.name:"+menu_name);
                /*  out of date
                if(navigator.language.startsWith("ko") && menu_name.indexOf("(")>0){
                    //console.log("name has (");
                    menu.menuName = menu_name.substr(0,menu_name.indexOf('('));
                    //console.log("menu.name:"+menu.name);
                    menu.description = menu_name.substr(menu_name.indexOf('('));
                    menu.descriptionHide=false;
                }else{
                    menu.descriptionHide=true;
                }
                */
                console.log("menu:"+JSON.stringify(menu));
                menus.push(menu);
            }
        });

        if(!navigator.language.startsWith("ko") && category.categoryNameEn!=undefined && category.categoryNameEn!=null){
            //console.log("!ko && hasEn");
            this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryNameEn,menus:menus});
        }else // Korean
            this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryName,menus:menus});

        console.log("[categories]:"+JSON.stringify(this.categories));
        //console.log("menus.length:"+menus.length);
    });
        //console.log("categories len:"+this.categories.length);
     
        this.categorySelected=0; // hum...
        
        if(navigator.language.startsWith("ko") && this.shop.shopInfo.hasOwnProperty("notice") && this.shop.shopInfo.notice!=null){
            let alert = this.alertCtrl.create({
                        title: this.shop.shopInfo.notice,
                        buttons: ['OK']
                    });
                    alert.present();
        }

        console.log("categories!!!!!!!!!!!!!!!!info:"+this.categories[0].menus[0].menuName);
        this.nowMenus=this.categories[0].menus;
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }       

  }

  loadShopInfo()
  {
        this.categorySelected=0;
        this.categories=[];

        console.log("[loadShopInfo]this.storageProvider.shopResponse: "+JSON.stringify(this.storageProvider.shopResponse));

        this.shopName=this.shop.shopInfo.shopName;

        if(this.shop.categories.length===0 || this.shop.menus.length===0){
            let alert = this.alertCtrl.create({
                        title:this.shopName+"는 현재 준비 중 입니다." ,
                        buttons: ['OK']
                    });
            alert.present().then(()=>{
                this.back();
            });
        }else{
            console.log("loadShopInfo-1");
            if(this.storageProvider.shopResponse.shopInfo.hasOwnProperty("shopPhone"))
                  this.shopPhoneHref="tel:"+this.shop.shopInfo.shopPhone;

            console.log("loadShopInfo-2");

            this.storageProvider.shopInfoSet(this.shop.shopInfo);
            this.configureShopInfo();

            console.log("loadShopInfo-3");

            // update shoplist at Serve (takitId,s3key)
            var thisShop:any={takitId:this.takitId , 
                                shopName:this.shop.shopInfo.shopName,
                                s3key: this.shop.shopInfo.imagePath, 
                                discountRate:this.shop.shopInfo.discountRate,
                                visitedTime:new Date()};
            if(this.shop.shopInfo.imagePath.startsWith("takitId/")){

            }else{
                thisShop.filename=this.storageProvider.awsS3+this.shop.shopInfo.imagePath;
            }
            /*
            this.storageProvider.shoplistCandidate=this.storageProvider.shoplist;
            this.storageProvider.shoplistCandidateUpdate(thisShop);
            console.log("loadShopInfo-ShopHomePage.. "+JSON.stringify(this.storageProvider.shoplistCandidate));
            this.storageProvider.shoplistSet(this.storageProvider.shoplistCandidate);
            this.storageProvider.shoplist[0].visitedDiff=0;

            let body = JSON.stringify({shopList:JSON.stringify(this.storageProvider.shoplistCandidate)});
            console.log("!!shopEnter-body:",body);
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            if(this.storageProvider.tourMode==false){    
                this.serverProvider.post(this.storageProvider.serverAddress+"/shopEnter",body).then((res:any)=>{
                    console.log("res.result:"+res.result);
                    var result:string=res.result;
                    if(result=="success"){

                    }else{
                        
                    }
                },(err)=>{
                    console.log("shopEnter-http post err "+err);
                    //Please give user an alert!
                    if(err=="NetworkFailure"){
                    let alert = this.alertController.create({
                            title: '서버와 통신에 문제가 있습니다',
                            subTitle: '네트웍상태를 확인해 주시기바랍니다',
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                });
            }*/
        }
  }

  categoryClick(sequence){
    console.log("[categoryChange] sequence:"+sequence+" previous:"+this.categorySelected);
    console.log("sequence type:"+typeof sequence+"categorySelected type:"+typeof this.categorySelected)
    // console.log("this.categoryMenuRows.length:"+this.categoryMenuRows.length);
    // if(this.categoryMenuRows.length>0){
        //why do need this length?
        //console.log("change menus");
        this.nowMenus=this.categories[sequence-1].menus;
        this.menus=[];
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }       
        this.categorySelected=sequence-1; //Please check if this code is correct.
    // }
    this.shophomeContentRef.resize();

    console.log("categorySelected:"+this.categorySelected);
  }

  selectMenu(menu){
    if(this.orderPageEntered)
        return;

    this.orderPageEntered=true;
    setTimeout(() => {
        console.log("reset orderPageEntered:"+this.orderPageEntered);
        this.orderPageEntered=false;
    }, 1000); //  seconds  
    let shopInfo={takitId:this.takitId, 
                address:this.shop.shopInfo.address, 
                shopName:this.shop.shopInfo.shopName,
                deliveryArea:this.shop.shopInfo.deliveryArea,
                freeDelivery:this.shop.shopInfo.freeDelivery,
                paymethod:this.shop.shopInfo.paymethod,
                deliveryFee:this.shop.shopInfo.deliveryFee};

    this.navCtrl.push(MenuPage, {menu:JSON.stringify(menu),
                                shopInfo:JSON.stringify(shopInfo),
                                class:"MenuPage"});
  }
  openCart(){
      this.app.getRootNav().push( CartPage,{class:"CartPage"});
  }
}
