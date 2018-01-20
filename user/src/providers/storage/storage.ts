import { Injectable } from '@angular/core';
import {Platform,Tabs,NavController} from 'ionic-angular';
import {ConfigProvider} from '../config/config';
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@ionic-native/native-storage';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
    public serverAddress:string= this.configProvider.getServerAddress();

    public awsS3OCR:string=this.configProvider.getAwsS3OCR();
    public awsS3:string=this.configProvider.getAwsS3();

    public OrdersInPage:number=this.configProvider.getOrdersInPage(); // The number of orders shown in a page 
    public TransactionsInPage:number=10; // The number of orders shown in a page 
    public userSenderID=this.configProvider.getUserSenderID(); //fcm senderID
    public version=this.configProvider.getVersion();
    public kakaoTakitUser=this.configProvider.getKakaoTakitUser();////Rest API key
    public kakaoOauthUrl=this.configProvider.getKakaoOauthUrl(); 

    public tourEmail=this.configProvider.getTourEmail();
    public tourPassword=this.configProvider.getTourPassword();

    public accountMaskExceptFront=this.configProvider.getAccountMaskExceptFront();
    public accountMaskExceptEnd=this.configProvider.getAccountMaskExceptEnd();

    public certUrl=this.configProvider.getCertUrl();

    syncTimeout=500; //0.5 second

    public id:string;
    public email:string="";
    public name:string="";
    public phone:string="";
    public couponList=[];
    public emailLogin:boolean=false;

    public recommendations=[];

    /////////////////////////////////////
    // cash receipt issue
    public receiptIssue=false;
    public receiptId:string;
    public receiptType:string="IncomeDeduction";  

    //public taxIssueCompanyName:string;
    //public taxIssueEmail:string;
    /////////////////////////////////////

    //public login:boolean=false;

    shopInfo;
    shoplistCandidate;

    public db;

    public tourMode=false;
    public cashId="";
    public cashAmount:number=0;

    public shoplist=[];          // 최근 주문 샵목록
    public frequentShopList=[];  // 최다 주문 샵목록
    public frequentMenuList=[];  // 최다 주문 메뉴 
                        // 직접 저장한 샵목록, 메뉴 목록 => 향후에 추가하기 
    shopResponse:any;
    takitId:string;
    payInfo=[];

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
              {name:"kb",color:"#756d62"},
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

defaultCardColor ="#33B9C6";            

  constructor(private configProvider:ConfigProvider,
              private sqlite: SQLite,
              private nativeStorage: NativeStorage) {

    console.log('Hello StorageProvider Provider');
   /*
    this.shopResponse={"result":"success","version":"0.04","shopInfo":{"takitId":"서울창업허브@그릿스테이크","address":" 서울시 마포구 백범로31길 21 3층 키친인큐베이터","imagePath":"서울창업허브@그릿스테이크_home.jpeg","shopName":"그릿 스테이크","businessType":null,"shopPhone":null,"contactPhone":null,"notice":null,"introduce":null,"discountRate":"0.5%","timezone":"Asia/Seoul","orderNumberCounter":"0","orderNumberCounterTime":null,"business":"off","businessTime":"[\"00:00~00:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"11:30~20:00\",\"00:00~00:00\"]","breakTime":"[\"14:00~17:00\"]","availOrderTime":"[\"11:00~13:30\",\"17:00~19:30\"]","sales":"0","balance":"0","withdrawalCount":"0","bankName":null,"bankCode":null,"depositer":null,"businessNumber":"348-87-00219","owner":"김지수","shopNameEn":null,"freeDelivery":null,"deliveryArea":null,"deliveryMSG":null,"bestMenus":null,"reviewList":"[]","ownerImagePath":null,"snsAddress":null,"keyword":"서울창업허브","takeout":"0"},
                       "menus":[{"menuNO":"서울창업허브@그릿스테이크;1","menuName":"채끝 등심 스테이크","explanation":"수비드(저온진공조리법)를 활용한 채끝 등심 스테이크에 감자튀김을 곁들인 메뉴","ingredient":null,"price":"9000","options":"[]","takeout":"0","imagePath":"서울창업허브@그릿스테이크;1_채끝 등심 스테이크.jpeg","requiredTime":null,"menuNameEn":null,"explanationEn":null,"ingredientEn":null,"optionsEn":null}],
                       "categories":[{"takitId":"서울창업허브@그릿스테이크","categoryNO":"1","sequence":"1","categoryName":"메인 메뉴","categoryNameEn":"main menu"}]};
 */
/*
   this.shopResponse={"result":"success","version":"0.04","shopInfo":{"takitId":"세종대@더큰도시락","address":"서울시 광진구 군자로 121 지하 1층","imagePath":"세종대@더큰도시락_main","shopName":"더큰도시락","businessType":null,"shopPhone":"024994888","contactPhone":"024994888","notice":"만원이상 주문시에만 배달 선택 가능합니다. 주문접수가 지연되면 매장정보에 전화번호를 클릭하여 전화부탁드립니다.","introduce":null,"discountRate":"3%","timezone":"Asia/Seoul","orderNumberCounter":"1","orderNumberCounterTime":"2017-11-30 00:01:19","business":"on","businessTime":"[\"10:00~18:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"08:00~19:40\",\"10:00~18:40\"]","breakTime":null,"availOrderTime":null,"sales":"498511","balance":"19497","withdrawalCount":"3","bankName":"신한","bankCode":"088","depositer":"민현주","businessNumber":"7721300255","owner":"민현주","shopNameEn":"The bigger","freeDelivery":"10000","deliveryArea":"세종대학교내","deliveryMSG":null,"bestMenus":null,"reviewList":"[]","ownerImagePath":null,"snsAddress":null,"keyword":"세종대","takeout":"2"},
                      "menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"데리치킨도시락","explanation":"","ingredient":null,"price":"3600","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_데리치킨도시락","requiredTime":null,"menuNameEn":"Teriyaki chicken ","explanationEn":"chicken","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},{"menuNO":"세종대@더큰도시락;1","menuName":"돈까스도시락","explanation":"","ingredient":null,"price":"3400","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_돈까스도시락","requiredTime":null,"menuNameEn":"Katsu ","explanationEn":"pork","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},
                               {"menuNO":"세종대@더큰도시락;1","menuName":"버섯불고기도시락","explanation":"","ingredient":null,"price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_버섯불고기도시락","requiredTime":null,"menuNameEn":"Mushroom bulgogi ","explanationEn":"beef","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},{"menuNO":"세종대@더큰도시락;1","menuName":"삼식도시락","explanation":"돈까스, 치킨, 숯불바베큐(돈까스소스)","ingredient":null,"price":"3700","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_삼식도시락","requiredTime":null,"menuNameEn":"Samsik ","explanationEn":"pork, chicken","ingredientEn":null,"optionsEn":"[{\"name\":\"Extra rice\",\"price\":\"200\"},{\"name\":\"Katsu 1pcs\",\"price\":\"1000\"},{\"name\":\"Spam 1pcs\",\"price\":\"1000\"}]"},
                               {"menuNO":"세종대@더큰도시락;1","menuName":"삼치도시락","explanation":"","ingredient":null,"price":"3800","options":"[{\"name\":\"밥곱빼기\",\"price\":\"200\"},{\"name\":\"돈까스한장\",\"price\":\"1000\"},{\"name\":\"스팸한장\",\"price\":\"1000\"}]","takeout":"1","imagePath":"세종대@더큰도시락;1_삼치도시락","requiredTime":null,"menuNa
*/

 }


    decryptValue(identifier,value){
        var key=value.substring(0, 16);
        var encrypt=value.substring(16, value.length);
        console.log("value:"+value+" key:"+key+" encrypt:"+encrypt);
        var decrypted=CryptoJS.AES.decrypt(encrypt,key);
        if(identifier=="id"){ // not good idea to save id here. Please make a function like getId
            this.id=decrypted.toString(CryptoJS.enc.Utf8);
        }
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    encryptValue(identifier,value){
        var buffer="";
        for (var i = 0; i < 16; i++) {
            buffer+= Math.floor((Math.random() * 10));
        }
        console.log("buffer"+buffer);
        var encrypted = CryptoJS.AES.encrypt(value, buffer);
        console.log("value:"+buffer+encrypted);
        
        if(identifier=="id") // not good idea to save id here. Please make a function like saveId
            this.id=value;
        return (buffer+encrypted);    
    }
 
    updatePayInfo(payInfo:string){
            this.payInfo=JSON.parse(payInfo);
            this.determinCardColor(); 
    }

    userInfoSetFromServer(userInfo:any){
        this.email=userInfo.email;
        this.name=userInfo.name;
        this.phone=userInfo.phone;
        this.couponList=JSON.parse(userInfo.couponList); ///userInfo의 couponList
        if(userInfo.receiptIssue=="1"){
            this.receiptIssue=true;
        }else{
            this.receiptIssue=false;
        }
        this.receiptId=userInfo.receiptId;
        this.receiptType=userInfo.receiptType;  
        if(!this.receiptIssue|| this.receiptIssue==undefined){
            this.receiptIssue=false;
            this.receiptType="IncomeDeduction";//default value   
        }
        
        if(!userInfo.hasOwnProperty("cashId") || userInfo.cashId==null || userInfo.cashId==undefined){
            this.cashId="";
        }else{
            this.cashId=userInfo.cashId;
        }

        console.log("userInfoSetFromServer:"+JSON.stringify(userInfo.payInfo));
        if(userInfo.payInfo==null || userInfo.payInfo==undefined){
            this.payInfo=[];
        }else{
            console.log("userInfoSetFromServer:"+JSON.stringify(userInfo.payInfo));
            this.payInfo=JSON.parse(userInfo.payInfo);
            this.determinCardColor(); 
        }
        console.log("userInfo.payInfo:"+JSON.stringify(this.payInfo));

        console.log("[userInfoSetFromServer]cashId:"+this.cashId);
        this.tourMode=false;
        if(userInfo.hasOwnProperty("recommendShops")){
            this.recommendations=userInfo.recommendShops;
            this.recommendations.forEach(element => {
                let strs=element.takitId.split("@");
                element.name_sub = strs[0];
                element.name_main= strs[1];
                element.paymethod=JSON.parse(element.paymethod);
                //console.log("cash:"+element.paymethod.cash);
                //console.log("card:"+element.paymethod.card);
            });
        }
        /*
        if(userInfo.hasOwnProperty("taxIssueEmail")){
            this.taxIssueEmail=userInfo.taxIssueEmail;
        }

        //console.log("[userInfoSetFromServer]userInfo:"+JSON.stringify(userInfo));
        if(userInfo.hasOwnProperty("taxIssueCompanyName")){
            this.taxIssueCompanyName=userInfo.taxIssueCompanyName;
        }
        */
    }

    shoplistSet(shoplistValue){
        if(shoplistValue==null)
            this.shoplist=[];
        else
            this.shoplist=shoplistValue;
        console.log("shoplistSet:"+JSON.stringify(shoplistValue));    
    }

    userInfoSet(email,name,phone,receiptIssue,receiptId,receiptType,recommends){
        this.email=email;
        this.name=name;
        this.phone=phone;
        this.tourMode=false;
        if(receiptIssue=="1"){
            this.receiptIssue=true;
        }else{
            this.receiptIssue=false;
        }
        this.receiptId=receiptId;
        this.receiptType=receiptType;  
        if(!this.receiptIssue|| this.receiptIssue==undefined){
            this.receiptIssue=false;
            this.receiptType="IncomeDeduction";//default value   
        }
        if(recommends){
            this.recommendations=recommends;
            this.recommendations.forEach(element => {
                let strs=element.takitId.split("@");
                element.name_sub = strs[0];
                element.name_main= strs[1];
                element.paymethod=JSON.parse(element.paymethod);
            });
        }
    }

    // cart = { takitId}
    resetCartInfo(){ // insert and update
      return new Promise((resolve,reject)=>{  
          console.log("resetCartInfo");

      });
    }

    open(){
        return new Promise((resolve,reject)=>{
            var options={
                    name: "takitCart.db",
                    location:'default'
            };
            
            this.sqlite.create(options)
            .then((db: SQLiteObject) => {
                this.db=db;
                this.db.executeSql("create table cart (id int AUTO_INCREMENT primary key, takitId VARCHAR(100),\
                 address VARCHAR(255), menuNo VARCHAR(255), menuName VARCHAR(255), options VARCHAR(255), \
                price int, quantity int, memo varchar(400));").then(()=>{
                    console.log("success to create cart table");
                    resolve();
                }).catch(e => {
                    resolve(); // just ignore it if it exists. hum.. How can I know the difference between error and no change?
                });
            }).catch(e =>{
                console.log("fail to open database"+JSON.stringify(e));
                reject();
            });
        });
    }

/*
 cart={ takitId: "test1@takit",
        address:"서울",
        menuNo:"test1@takit;1", 
        menuName:"도시락",
        options:"{}",
        quantity:1 
        price: 1000
        memo:""}; 
        

INSERT INTO cart(takitId, address, menuNo, menuName,options,quantity,price,memo) VALUES("test1@takit","서울","test1@takit;1","도시락","{}", 1,1000,"memo");
INSERT INTO cart(takitId, address, menuNo, menuName,options,quantity,price,memo) VALUES("test1@takit","서울","test1@takit;1","비빔밥","{}", 1,1000,"memo");
INSERT INTO cart(takitId, address, menuNo, menuName,options,quantity,price,memo) VALUES("test2@takit","서울","test2@takit;1","도시락","{}", 1,1000,"memo");
INSERT INTO cart(takitId, address, menuNo, menuName,options,quantity,price,memo) VALUES("test2@takit","서울","test2@takit;1","비빔밥","{}", 1,1000,"memo");

 ORDER BY takitId 
 
 setQuantityMenu(uniqueId,quantity)
 deleteMenu(uniqueId)
*/
    addMenuIntoCart(shopInfo,menuInfo){ 
      return new Promise((resolve,reject)=>{  
            console.log("addMenuIntoCart");
            let queryString:string;
            queryString="INSERT INTO cart(takitId, address, menuNo, menuName,options,quantity,price,memo) VALUES(?,?,?,?,?,?,?,?)";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[shopInfo.takitId,shopInfo.address,menuInfo.menuNo,
                              menuInfo.menuName,menuInfo.options, menuInfo.quantity,menuInfo.price,menuInfo.memo]).then((resp)=>{
                console.log("[saveCartInfo]resp:"+JSON.stringify(resp));
                let queryString="SELECT LAST_INSERT_ID()";
                this.db.executeSql(queryString,[]).then((result)=>{
                    console.log("result:"+JSON.stringify(result));
                    resolve(result);
                })
            }).catch(e => {
                console.log("addMenuIntoCart error:"+JSON.stringify(e));
                reject("DB error");
            });
      });
    }

    deleteMenu(uniqueId){
      return new Promise((resolve,reject)=>{  
            console.log("deleteMenu");
            let queryString:string;
            queryString="DELETE FROM cart where id=";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[uniqueId]).then((resp)=>{
                console.log("[deleteMenu]resp:"+JSON.stringify(resp));
                resolve(resp);
            }).catch(e => {
                console.log("deleteMenu error:"+JSON.stringify(e));
                reject("DB error");
            });
      });
    }

   deleteAll(){
      return new Promise((resolve,reject)=>{  
            console.log("deleteMenu");
            let queryString:string;
            queryString="TRUNCATE TABLE cart;";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[]).then((resp)=>{
                console.log("[deleteAll]resp:"+JSON.stringify(resp));
                resolve(resp);
            }).catch(e => {
                console.log("deleteAll error:"+JSON.stringify(e));
                reject("DB error");
            });
      });     
   }

   setMenuQuantity(uniqueId,quantity){
      return new Promise((resolve,reject)=>{  
            console.log("setMenuQuantity");
            let queryString="UPDATE carts SET quantity=? WHERE id=?";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[quantity,uniqueId]).then((resp)=>{
                console.log("[setMenuQuantity]resp:"+JSON.stringify(resp));
                resolve(resp);
            }).catch(e => {
                console.log("setMenuQuantity  error:"+JSON.stringify(e));
                reject("DB error");
            });
      });     
        
   }

    getCartInfo(){
        console.log("getCartInfo-enter");
        return new Promise((resolve,reject)=>{
                var queryString='SELECT * FROM carts order by takitId';
                console.log("call queryString:"+queryString);
                this.db.executeSql(queryString,[]).then((resp)=>{ // What is the type of resp? 
                    console.log("query result:"+JSON.stringify(resp));
                    var output=[];
                    if(resp.rows.length==1){
                        console.log("item(0)"+JSON.stringify(resp.rows.item(0)));
                        output.push(resp.rows.item(0)); 
                    }else if(resp.rows.length==0){
                        console.log(" no cart info");
                    }else{
                        console.log("DB error happens");
                        reject("invalid DB status");
                    }
                    resolve(output);
                }).catch(e => {
                     reject("DB error");
                });
         });
    }

   dropCartInfo(){
       return new Promise((resolve,reject)=>{
           this.db.executeSql("drop table if exists carts").timeout(1000/* 1 second */).then(
               ()=>{
                    console.log("success to drop cart table");
                    resolve();
           }).catch(e => {
                    console.log("fail to drop cart table "+JSON.stringify(e));
                    reject();
                },);
       });
   }
    
    reset(){
        console.log("storageProvider.reset");
        if(this.db!=undefined) this.db.close();
        this.db=undefined;
        this.shoplist=[];
       // this.takitId=undefined; 
       // this.shopInfo=undefined;   
       // this.shoplistCandidate=[];
       // this.cart=undefined;
        this.id=undefined;
        this.email="";
        this.name="";
        this.phone="";
        this.shopResponse=undefined;
       // this.run_in_background=false;
        this.tourMode=false;
        this.cashId="";
        this.cashAmount=undefined;
        this.payInfo=[];
       // this.refundBank="";
       // this.refundAccount="";
        /////////////////////////////////////
        // 캐쉬정보 수동입력 
       // this.depositBank=undefined;
       // this.depositBranch=undefined;
       // this.depositBranchInput=undefined;
    }   

     shopInfoSet(shopInfo:any){
        console.log("shopInfoSet:"+JSON.stringify(shopInfo));
        this.shopInfo=shopInfo;
        //console.log("discountRate:"+this.shopInfo.discountRate);
    } 
 
     shoplistCandidateUpdate(shop){
        var update=[];
        if(this.shoplistCandidate)
        for(var i=0;i<this.shoplistCandidate.length;i++){
            if(this.shoplistCandidate[i].takitId!=shop.takitId){
                update.push(this.shoplistCandidate[i]);
            }
        }
        console.log("shoplistCandidate:"+JSON.stringify(update));
        update.unshift(shop);
        this.shoplistCandidate=update;
        console.log("after shoplist update:"+JSON.stringify(this.shoplistCandidate));        
    }

    determinCardColor(){
        console.log("determinCardColor");
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
