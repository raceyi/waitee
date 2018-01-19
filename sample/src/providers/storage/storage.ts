import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {

    receiptIssue = true;
    receiptIdMask ="010XXXX8226";
    //receiptType='IncomeDeduction';
    receiptType='ExpenseProof';

  shopResponse:any;
  awsS3="https://s3.ap-northeast-2.amazonaws.com/seerid.cafe.image/";

  public frequentShopList=[];

    banklist=[  {name:"국민",value:"004"},
                {name:"기업",value:"003"},
                {name:"농협",value:"011"},
                {name:"신한",value:"088"},
                {name:"우리",value:"020"},
                {name:"KEB하나",value:"081"},  
                {name:"SC제일",value:"023"},
                {name:"경남",value:"039"},
                {name:"광주",value:"034"},
                {name:"대구",value:"031"},
                {name:"부산",value:"032"},
                {name:"산업",value:"002"},
                {name:"상호저축",value:"050"},
                {name:"새마을금고",value:"045"},
                {name:"수협",value:"007"}, 
                {name:"신협",value:"048"}, 
                {name:"우체국",value:"071"},
                {name:"전북",value:"037"},
                {name:"제주",value:"035"},
                {name:"한국씨티",value:"027"},
                {name:"산림조합",value:"064"},
                {name:"BOA",value:"060"},
                {name:"도이치",value:"055"},
                {name:"HSBC",value:"054"},
                {name:"제이피모간체이스",value:"057"},
                {name:"중국공상",value:"062"},
                {name:"비엔피파리바",value:"061"},
                {name:"케이뱅크", value:"089"},
                {name:"카카오뱅크", value:"090"}];

    manualbanklist=[
                {name:"토스", value:"-1"},
                {name:"카카오페이", value:"-2"},  
                {name:"국민",value:"004"},
                {name:"기업",value:"003"},
                {name:"농협",value:"011"},
                {name:"신한",value:"088"},
                {name:"우리",value:"020"},
                {name:"KEB하나",value:"081"},  
                {name:"SC제일",value:"023"},
                {name:"경남",value:"039"},
                {name:"광주",value:"034"},
                {name:"대구",value:"031"},
                {name:"부산",value:"032"},
                {name:"산업",value:"002"},
                {name:"상호저축",value:"050"},
                {name:"새마을금고",value:"045"},
                {name:"수협",value:"007"}, 
                {name:"신협",value:"048"}, 
                {name:"우체국",value:"071"},
                {name:"전북",value:"037"},
                {name:"제주",value:"035"},
                {name:"한국씨티",value:"027"},
                {name:"산림조합",value:"064"},
                {name:"BOA",value:"060"},
                {name:"도이치",value:"055"},
                {name:"HSBC",value:"054"},
                {name:"제이피모간체이스",value:"057"},
                {name:"중국공상",value:"062"},
                {name:"비엔피파리바",value:"061"},
                {name:"케이뱅크", value:"089"},
                {name:"카카오뱅크", value:"090"}];

cardColorlist=[
              {name:"bc",color:"#ec4855"},
              {name:"shinhan",color:"#134596"},
              {name:"samsung",color:"#0d62a8"},
              {name:"kb",color:"#756d62"}, //국민 
              {name:"hyundai",color:"#000000"},
              {name:"woori",color:"#1a9fda"},
              {name:"lotte",color:"#e02431"},
              {name:"hana",color:"#108375"},
              {name:"kakao", color:"#EBE315"},
              {name:"master", color:"#fc601f"},
              {name:"union",color:"#fb0f1c"},
              {name:"visa", color:"#1a215d"},
              {name:"비씨",color:"#ec4855"},
              {name:"신한",color:"#134596"},
              {name:"삼성",color:"#0d62a8"},
              {name:"국민",color:"#756d62"},
              {name:"현대",color:"#000000"},
              {name:"우리",color:"#1a9fda"},
              {name:"롯데",color:"#e02431"},
              {name:"하나",color:"#108375"},
              {name:"카카오", color:"#EBE315"},
              {name:"마스터", color:"#fc601f"},
              {name:"유니온페이",color:"#fb0f1c"},
              {name:"비자", color:"#1a215d"}];

payInfo=[{customer_uid:"kalen.lee_xxxxx",info:{ mask_no:'xxxx-xxxx-xxxx-xxxxx',name:'bc카드'}},
         {customer_uid:"kalen.lee_xxxxx",info:{ mask_no:'xxxx-xxxx-xxxx-xxxxx',name:'visa카드'}}
];

defaultCardColor ="#33B9C6";                     

  constructor(public http: HttpClient) {

    console.log('Hello StorageProvider Provider');
   
    this.shopResponse={"result":"success","version":"0.04","shopInfo":{"takitId":"서울창업허브@그릿스테이크","address":" 서울시 마포구 백범로31길 21 3층 키친인큐베이터","imagePath":"서울창업허브@그릿스테이크_home.jpeg","shopName":"그릿 스테이크","businessType":null,"shopPhone":null,"contactPhone":null,"notice":null,"introduce":null,"discountRate":"0.5%","timezone":"Asia/Seoul","orderNumberCounter":"0","orderNumberCounterTime":null,"business":"off","businessTime":"[\"00:00~00:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"00:00~00:00\"]","breakTime":"[\"14:00~17:00\"]","availOrderTime":"[\"11:00~13:30\",\"17:00~19:30\"]","sales":"0","balance":"0","withdrawalCount":"0","bankName":null,"bankCode":null,"depositer":null,"businessNumber":"348-87-00219","owner":"김지수","shopNameEn":null,"freeDelivery":null,"deliveryArea":null,"deliveryMSG":null,"bestMenus":null,"reviewList":"[]","ownerImagePath":null,"snsAddress":null,"keyword":"서울창업허브","takeout":"0"},
                       "menus":[{"menuNO":"서울창업허브@그릿스테이크;1","menuName":"채끝 등심 스테이크","explanation":"수비드(저온진공조리법)를 활용한 채끝 등심 스테이크에 감자튀김을 곁들인 메뉴","ingredient":null,"price":"9000","options":"[]","takeout":"0","imagePath":"서울창업허브@그릿스테이크;1_채끝 등심 스테이크.jpeg","requiredTime":null,"menuNameEn":null,"explanationEn":null,"ingredientEn":null,"optionsEn":null}],
                       "categories":[{"takitId":"서울창업허브@그릿스테이크","categoryNO":"1","sequence":"1","categoryName":"메인 메뉴","categoryNameEn":"main menu"}]};
 
/*
   this.shopResponse={"result":"success","version":"0.04","shopInfo":{"takitId":"세종대@더큰도시락","address":"서울시 광진구 군자로 121 지하 1층","imagePath":"세종대@더큰도시락_main","shopName":"더큰도시락","businessType":null,"shopPhone":"024994888","contactPhone":"024994888","notice":"만원이상 주문시에만 배달 선택 가능합니다. 주문접수가 지연되면 매장정보에 전화번호를 클릭하여 전화부탁드립니다.","introduce":null,"discountRate":"3%","timezone":"Asia/Seoul","orderNumberCounter":"1","orderNumberCounterTime":"2017-11-30 00:01:19","business":"on","businessTime":"[\"10:00~18:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"10:00~18:40\"]","breakTime":null,"availOrderTime":null,"sales":"498511","balance":"19497","withdrawalCount":"3","bankName":"신한","bankCode":"088","depositer":"민현주","businessNumber":"7721300255","owner":"민현주","shopNameEn":"The bigger","freeDelivery":"10000","deliveryArea":"세종대학교내","deliveryMSG":null,"bestMenus":null,"reviewList":"[]","ownerImagePath":null,"snsAddress":null,"keyword":"세종대","takeout":"2"},
                      "menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"데리치킨도시락","explanation":"","ingredient":null,"price":"3600","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_데리치킨도시락","requiredTime":null,"menuNameEn":"Teriyaki chicken ","explanationEn":"chicken","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","explanation":"","ingredient":null,"price":"3400","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_돈까스도시락","requiredTime":null,"menuNameEn":"Katsu ","explanationEn":"pork","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},
                               {"menuNO":"세종대@더큰도시락;1","menuName":"버섯불고기도시락","explanation":"","ingredient":null,"price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_버섯불고기도시락","requiredTime":null,"menuNameEn":"Mushroom bulgogi ","explanationEn":"beef","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},{"menuNO":"세종대@더큰도시락;1","menuName":"삼식도시락","explanation":"돈까스, 치킨, 숯불바베큐(돈까스소스)","ingredient":null,"price":"3700","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_삼식도시락","requiredTime":null,"menuNameEn":"Samsik ","explanationEn":"pork, chicken","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},
                               {"menuNO":"세종대@더큰도시락;1","menuName":"삼치도시락","explanation":"","ingredient":null,"price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_삼치도시락","requiredTime":null,"menuNa
*/
    this.determinCardColor(); 
 }

  determinCardColor(){
    this.payInfo.forEach((payment:any)=>{
        payment.background=this.defaultCardColor;
        for(var i=0;i<this.cardColorlist.length;i++){
              let name:string=payment.info.name;
              if(name.toLocaleLowerCase().startsWith(this.cardColorlist[i].name)){
                    payment.background=this.cardColorlist[i].color;
              }
        }
    })
    console.log("payments:"+JSON.stringify(this.payInfo));
  }

}
