import { Injectable ,EventEmitter} from '@angular/core';
import { AlertController,Events} from 'ionic-angular';
import {Platform,Tabs,NavController} from 'ionic-angular';
import {ConfigProvider} from '../config/config';
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@ionic-native/native-storage';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import {CartProvider} from '../../providers/cart/cart';
var storageProvider;
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
    public authReturnUrl=this.configProvider.getAuthReturnUrl();
    public authFailReturnUrl=this.configProvider.getAutFailReturnUrl();
    public tossApiKey=this.configProvider.getTossApiKey();

    public device=this.configProvider.device;
    
    syncTimeout=500; //0.5 second

    //public messageEmitter= new EventEmitter();

    public id:string;
    public email:string="";
    public name:string="";
    public phone:string="";
    public couponList=[];
    public emailLogin:boolean=false;

    public recommendations=[];
    public wholeStores=[];

    public tabs;
    /////////////////////////////////////
    // cash receipt issue
    public receiptIssue=false;
    public receiptId:string;
    public receiptType:string="IncomeDeduction";  

    //public taxIssueCompanyName:string;
    //public taxIssueEmail:string;
    /////////////////////////////////////

    //public login:boolean=false;
    
    backgroundMode:boolean=false;

    shopInfo;

    public tourMode=false;
    public cashId="";
    public cashAmount:number=0;

    public shopList=[];          // 최근 주문 샵목록
    shopResponse:any;
    takitId:string;
    payInfo=[];

    public cashInProgress=[];
    public orderInProgress=[];

    stampCount=[];

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
                {name:"페이코", value:"-3"},   
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
              private nativeStorage: NativeStorage,
              private cartProvider:CartProvider,
              private alertCtrl:AlertController,
              private events:Events,              
              platform: Platform) {
    console.log('Hello StorageProvider Provider');
    storageProvider=this;
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
            this.wholeStores=userInfo.recommendShops;
            this.wholeStores.forEach(element => {
                let strs=element.takitId.split("@");
                element.name_sub = strs[0];
                element.name_main= strs[1];
                element.paymethod=JSON.parse(element.paymethod);
                if(element.rate!=null){
                    let num:number=element.rate;
                    element.rate=num.toFixed(1);
                }
                //console.log("cash:"+element.paymethod.cash);
                //console.log("card:"+element.paymethod.card);
            });
            this.recommendations=[];
            this.wholeStores.forEach(shop=>{
                console.log("shop.ready:"+shop.ready);
                if(shop.ready==1){
                    this.recommendations.push(shop);
                }
            })
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

   //////////////////////////////////////////////////////////////
   // updateShopList -begin
    compareShop;     // any other way not to use member varaible ?
    isSameShop(element){
         console.log("element:"+JSON.stringify(element));
         console.log("shop:"+JSON.stringify(storageProvider.compareShop));         
         if(element.takitId==storageProvider.compareShop.takitId)
                return true;
         return false;   
    }

    updateShopList(shops:any){
        for(var i=0;i<shops.length;i++){
            this.compareShop=shops[i];

            let strs=shops[i].takitId.split("@");
            shops[i].name_sub = strs[0];
            shops[i].name_main= strs[1];

            let index=this.shopList.findIndex(this.isSameShop);
            console.log("index:"+index);
            if(index>=0){
                this.shopList.splice(index,1);
            }
        }
        console.log("this.shoplist:"+JSON.stringify(this.shopList));
        this.shopList=shops.concat(this.shopList);
        if(this.shopList.length>5)
            this.shopList.splice(5,this.shopList.length-5);
        console.log("shoplist:"+JSON.stringify(this.shopList));

    };
   // updateShopList -end
    /////////////////////////////////////////////////////////////////

    shoplistSet(shoplistValue){
        if(shoplistValue==null)
            this.shopList=[];
        else
            this.shopList=shoplistValue;
        this.shopList.forEach(element => {
            let strs=element.takitId.split("@");
            element.name_sub = strs[0];
            element.name_main= strs[1];
        });
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

/////////////////////////////////////////////////////////////////////////////////////////////////////
    
    reset(){
        console.log("storageProvider.reset");
        if(this.cartProvider.db!=undefined){
            this.cartProvider.dropCartInfo();
            this.cartProvider.db.close(); // humm... should I remove db here? how about logout? 
        } 
        this.nativeStorage.clear();
        this.cartProvider.db=undefined;
        this.shopList=[];
        this.takitId=undefined; 
        this.shopInfo=undefined;   
        this.id=undefined;
        this.email="";
        this.name="";
        this.phone="";
        this.shopResponse=undefined;
        this.tourMode=false;
        this.cashId="";
        this.cashAmount=undefined;
        this.payInfo=[];
        this.cashInProgress=[];
        this.orderInProgress=[];
    }   

     shopInfoSet(shopInfo:any){
        console.log("shopInfoSet:"+JSON.stringify(shopInfo));
        this.shopInfo=shopInfo;
        //console.log("discountRate:"+this.shopInfo.discountRate);
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
////////////////////////////////////////////////////////////////////////////////////////////////////
    orderExistInProgress(orderId){
        console.log("orderInProgress.length:"+this.orderInProgress.length);    
        for(let i=0;i<this.orderInProgress.length ;i++){
            console.log("orderInProgress["+i+"]:"+this.orderInProgress[i].order.orderId);
            console.log("orderId:"+orderId);

            if(this.orderInProgress[i]!=undefined && this.orderInProgress[i].order.orderId==orderId){
                return true;
            }
        }    
        return false;

    }

    orderAddInProgress(order,viewController){
        this.orderInProgress.push({order:order,viewController:viewController});
        for(var i=0;i<this.orderInProgress.length;i++)
            console.log("Add-orderInProgress["+i+"]:"+JSON.stringify(this.orderInProgress[i].order));
    }

    orderRemoveInProgress(orderId,viewController){
        var idx=-1;
        for(let i=0;i<this.orderInProgress.length;i++){
            if(this.orderInProgress[i].order.orderId==orderId 
                && this.orderInProgress[i].viewController==viewController){
                    console.log("i:"+i);
                    idx=i;
                    break;
                }
        }
        if(idx>=0){
            console.log("call splice with "+idx);
            this.orderInProgress.splice(idx,1);
        }
        /////////////////////////////////////////////    
        for(let i=0;i<this.orderInProgress.length;i++)
            console.log("Remove-orderInProgress["+i+"]:"+JSON.stringify(this.orderInProgress[i].order));
    }

    cashExistInProgress(cash){
        var cashStr;
        if(typeof cash !== 'string'){  
            cashStr=JSON.stringify(cash);
        }else
            cashStr=cash;
            console.log("cashAddInProgress.length:"+this.cashAddInProgress.length);    
            for(var i=0;i<this.cashAddInProgress.length;i++){
                console.log("cashAddInProgress["+i+"]:"+JSON.stringify(this.cashAddInProgress[i]));
                if(this.cashAddInProgress[i]!=undefined && this.cashAddInProgress[i].cashStr==cashStr){
                    return true;
                }
            }    
        return false;
    }

    cashAddInProgress(cashStr,viewController){
        this.cashInProgress.push({cashStr:cashStr,viewController:viewController});
        /////////////////////////////////////////////
        for(var i=0;i<this.cashInProgress.length;i++)
            console.log("Add-cashInProgress["+i+"]:"+this.cashInProgress[i].cashStr);
    }

    cashRemoveInProgress(cash,viewController){
        let idx=-1;
        for(let i=0;i<this.cashInProgress.length;i++){
            if(this.cashInProgress[i].cashStr==cash 
                && this.cashInProgress[i].viewController==viewController){
                    console.log("i:"+i);
                    idx=i;
                    break;
                }
        }
        if(idx>=0){
            console.log("call splice with "+idx);
            this.cashInProgress.splice(idx,1);
        }
        /////////////////////////////////////////////    
        for(let i=0;i<this.cashInProgress.length;i++)
            console.log("Remove-cashInProgress["+i+"]:"+this.cashInProgress[i].cashStr);
    }    

}
