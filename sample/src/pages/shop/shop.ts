import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {MenuPage} from '../menu/menu';
import {TabsPage} from '../tabs/tabs';

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
  categories;
  menus=[];
  shopInfo:any;
  shopPhoneHref;
  categorySelected=0;
  public imgPath;
  shopImage;
  ngStyle;

  constructor(public navCtrl: NavController, public navParams: NavParams,public storageProvider:StorageProvider) {

  if(this.storageProvider.shopResponse.hasOwnProperty('shopInfo')){
        this.shopInfo={"takitId":"서울창업허브@그릿스테이크",
                       "address":" 서울시 마포구 백범로31길 21 3층 키친인큐베이터",
                       "imagePath":"서울창업허브@그릿스테이크_home.jpeg",
                       "shopName":"그릿 스테이크",
                       "businessType":null,
                       "shopPhone":null,
                       "contactPhone":null,
                       "notice":null,
                       "introduce":null,
                       "discountRate":"0.5%",
                       "timezone":"Asia/Seoul",
                       "orderNumberCounter":"0",
                       "orderNumberCounterTime":null,
                       "business":"off",
                       "businessTime":"[\"00:00~00:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"00:00~00:00\"]",
                       "breakTime":"[\"14:00~17:00\"]",
                       "availOrderTime":"[\"11:00~13:30\",\"17:00~19:30\"]",
                       "sales":"0",
                       "balance":"0",
                       "withdrawalCount":"0",
                       "bankName":null,
                       "bankCode":null,
                       "depositer":null,
                       "businessNumber":"348-87-00219",
                       "owner":"김지수",
                       "shopNameEn":null,
                       "freeDelivery":null,
                       "deliveryArea":null,
                       "deliveryMSG":null,
                       "bestMenus":null,
                       "reviewList":"[]",
                       "ownerImagePath":null,
                       "snsAddress":null,
                       "keyword":"서울창업허브",
                       "takeout":"0"};
          this.shopInfo.businessTimes=JSON.parse(this.shopInfo.businessTime);

          this.shopInfo={"takitId":"세종대@더큰도시락",
                         "address":"서울시 광진구 군자로 121 지하 1층",
                         "imagePath":"세종대@더큰도시락_main",
                         "shopName":"더큰도시락",
                         "businessType":null,
                         "shopPhone":"024994888",
                         "contactPhone":"024994888",
                         "notice":"만원이상 주문시에만 배달 선택 가능합니다. 주문접수가 지연되면 매장정보에 전화번호를 클릭하여 전화부탁드립니다.",
                         "introduce":null,
                         "discountRate":"3%",
                         "timezone":"Asia/Seoul",
                         "orderNumberCounter":"1",
                         "orderNumberCounterTime":"2017-11-30 00:01:19",
                         "business":"on",
                         "businessTime":"[\"10:00~18:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"10:00~18:40\"]",
                         "breakTime":null,
                         "availOrderTime":null,
                         "sales":"498511",
                         "balance":"19497",
                         "withdrawalCount":"3",  // reset하자 
                         "bankName":"신한",
                         "bankCode":"088",
                         "depositer":"민현주",
                         "businessNumber":"7721300255",
                         "owner":"민현주",
                         "shopNameEn":"The bigger",
                         "freeDelivery":"10000",
                         "deliveryArea":"세종대학교내",
                         "deliveryMSG":null,
                         "bestMenus":null,
                         "reviewList":"[]",
                         "ownerImagePath":null,
                         "snsAddress":null,
                         "keyword":"세종대",
                         "takeout":"2",
                         "paymethod":{'card':'2%','cash':'5%'}};       
          this.shopInfo.businessTimes=JSON.parse(this.shopInfo.businessTime);  
          this.shopInfo.regularOff="토,일"; 
          if(this.shopInfo.shopPhone!='null' && this.shopInfo){
              this.shopPhoneHref="tel:"+this.shopInfo.shopPhone;
          }    

          this.imgPath="https://s3.ap-northeast-2.amazonaws.com/seerid.cafe.image/세종대@더큰도시락_main";
          this.ngStyle={'background-image': 'url('+ this.imgPath + ')'};
  }

 this.categories=[{"takitId":"세종대@더큰도시락","categoryNO":"1","categoryName":"정식도시락","categoryNameEn":"Basic",sequence:1 ,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"2","categoryName":"실속도시락","categoryNameEn":"Couple ",sequence:2,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"3","categoryName":"마요도시락","categoryNameEn":"Mayo ",sequence:3,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"4","categoryName":"반반마요도시락","categoryNameEn":"Mayo combo ",sequence:4,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"5","categoryName":"매콤마요도시락","categoryNameEn":"Spicy mayo ",sequence:5,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"6","categoryName":"덮밥도시락","categoryNameEn":"Rice ",sequence:6,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"7","categoryName":"볶음밥도시락","categoryNameEn":"Fried rice ",sequence:7,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"8","categoryName":"특선도시락","categoryNameEn":"Luxury ",sequence:8,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"9","categoryName":"스페셜도시락","categoryNameEn":"Special ",sequence:9,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"10","categoryName":"비빔밥도시락","categoryNameEn":"Bibimbap",sequence:10,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"11","categoryName":"카레도시락","categoryNameEn":"Curry ",sequence:11,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"12","categoryName":"돈부리시리즈","categoryNameEn":"Donburi",sequence:12,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"13","categoryName":"얼큰한 국물","categoryNameEn":"Spicy Soup",sequence:13,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"14","categoryName":"이색BOX","categoryNameEn":"Fried food",sequence:14,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"15","categoryName":"분식","categoryNameEn":"Snack bar",sequence:15,menus:[]},
                {"takitId":"세종대@더큰도시락","categoryNO":"16","categoryName":"사이드메뉴","categoryNameEn":"Side",sequence:16,menus:[]}];
   
    let menus=[{"menuNO":"세종대@더큰도시락;1","menuName":"데리치킨도시락","explanation":"","price":"3600","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_데리치킨도시락","requiredTime":null,"menuNameEn":"Teriyaki chicken ","explanationEn":"chicken","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","explanation":"","price":"3400","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_돈까스도시락","requiredTime":null,"menuNameEn":"Katsu ","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"버섯불고기도시락","explanation":"","price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_버섯불고기도시락","requiredTime":null,"menuNameEn":"Mushroom bulgogi ","explanationEn":"beef","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"삼식도시락","explanation":"돈까스, 치킨, 숯불바베큐(돈까스소스)","price":"3700","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_삼식도시락","requiredTime":null,"menuNameEn":"Samsik ","explanationEn":"pork, chicken","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"삼치도시락","explanation":"","price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_삼치도시락","requiredTime":null,"menuNameEn":"Cero ","explanationEn":"cero","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"양념치킨도시락","explanation":"","price":"3400","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_양념치킨도시락","requiredTime":null,"menuNameEn":"Spicy fried chicken ","explanationEn":"chicken","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"제육볶음도시락","explanation":"","price":"3200","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_제육볶음도시락","requiredTime":null,"menuNameEn":"Spicy pork ","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"치킨도시락","explanation":"","price":"3300","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_치킨도시락","requiredTime":null,"menuNameEn":"Fried chicken ","explanationEn":"chicken","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"칠리탕수육도시락","explanation":"칠리소스(매콤한맛)","price":"3300","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_칠리탕수육도시락","requiredTime":null,"menuNameEn":"Chili fried pork ","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;1","menuName":"칠리포크도시락","explanation":"돈까스, 탕수육, 숯불바베큐(칠리소스)","price":"3700","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_칠리포크도시락","requiredTime":null,"menuNameEn":"Chili pork ","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;10","menuName":"버섯불고기비빔밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"500\"},{\"name\":\"계란후라이\",\"choice\":[\"반숙\",\"완숙\"],\"default\":\"반숙\",\"price\":\"0\"}]","takeout":"1","imagePath":"세종대@더큰도시락;10_버섯불고기비빔밥","requiredTime":null,"menuNameEn":"Mushroom bulgogi","explanationEn":"beef","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"500\"},{\"name\":\"Fried egg type\",\"choice\":[\"sunny side up\",\"over hard\"],\"default\":\"sunny side up\",\"price\":\"0\"}]"},
            {"menuNO":"세종대@더큰도시락;10","menuName":"새콤달콤회덮밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;10_새콤달콤회덮밥","requiredTime":null,"menuNameEn":"Raw fish","explanationEn":"fish","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;10","menuName":"오채참치비빔밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"500\"},{\"name\":\"계란후라이\",\"choice\":[\"반숙\",\"완숙\"],\"default\":\"반숙\",\"price\":\"0\"}]","takeout":"1","imagePath":"세종대@더큰도시락;10_오채참치비빔밥","requiredTime":null,"menuNameEn":"Vegetable tuna","explanationEn":"tuna","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"500\"},{\"name\":\"Fried egg type\",\"choice\":[\"sunny side up\",\"over hard\"],\"default\":\"sunny side up\",\"price\":\"0\"}]"},
            {"menuNO":"세종대@더큰도시락;11","menuName":"돈까스카레","explanation":"","price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;11_돈까스카레","requiredTime":null,"menuNameEn":"Katsu ","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;11","menuName":"치킨카레","explanation":"","price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;11_치킨카레","requiredTime":null,"menuNameEn":"Fried chicken ","explanationEn":"chicken, pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;11","menuName":"카레라이스","explanation":"","price":"2900","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;11_카레라이스","requiredTime":null,"menuNameEn":"Basic","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;12","menuName":"김치돈까스돈부리덮밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;12_김치돈까스돈부리덮밥","requiredTime":null,"menuNameEn":"Kimchi Katsu","explanationEn":"pork, kimchi","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;12","menuName":"돈까스돈부리덮밥","explanation":"","price":"3300","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;12_돈까스돈부리덮밥","requiredTime":null,"menuNameEn":"Katsu","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;12","menuName":"매콤돈까스돈부리덮밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;12_매콤돈까스돈부리덮밥","requiredTime":null,"menuNameEn":"Spicy Katsu","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;12","menuName":"청양돈까스돈부리덮밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;12_청양돈까스돈부리덮밥","requiredTime":null,"menuNameEn":"Very spicy katsu","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"},
            {"menuNO":"세종대@더큰도시락;12","menuName":"청양돈까스돈부리덮밥","explanation":"","price":"3500","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"}]","takeout":"1","imagePath":"세종대@더큰도시락;12_청양돈까스돈부리덮밥","requiredTime":null,"menuNameEn":"Very spicy katsu","explanationEn":"pork","optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"}]"}];                  

     for(var i=0;i<menus.length/2;i++){
           let pair=[];
           pair.push(menus[i*2]);
           pair.push(menus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
     }       
  }

  ionViewWillEnter(){ 

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

  categoryClick(i){ // please use the sequence value

  }

  selectMenu(menu){
       let shopInfo={takitId:this.shopInfo.takitId, 
                    address:this.shopInfo.address, 
                    shopName:this.shopInfo.shopName}
       this.navCtrl.push(MenuPage, {menu:JSON.stringify(menu),shopInfo:JSON.stringify(shopInfo)});
  }

  back(){
    if(this.navCtrl.canGoBack())
        this.navCtrl.pop();
    else
        this.navCtrl.setRoot(TabsPage);
  }
}
