import {Injectable} from '@angular/core';
import {Platform ,NavController,LoadingController,AlertController} from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import * as CryptoJS from 'crypto-js';
import {ConfigProvider} from './configProvider';

declare var cordova:any;

@Injectable()
export class StorageProvider{

    public myshoplist=[];
    public myshop:any={}; // manager, takitId, ???
    public shopInfo:any;   // current shopInfo. shopname:shopInfo.shopName
    public shop:any;
    public nowMenuNO:string; // current selected menuNO. 메뉴 추가 같은 화면에서 두번 진행 시 이상한 값 들어오기 때문에 저장.
    public errorReason:string;
    public id:string;
    public printerName; // printerName saved
    public printerConnect=true;
    public navController:NavController;
    public login:boolean=false;
    public printOn:boolean=false;
    public amIGotNoti=false;
    public storeOpen=false;

    public tourMode=false;
    public tourEmail=this.configProvider.getTourEmail();
    public tourPassword=this.configProvider.getTourPassword();
    public pollingInterval=3; // default value in minutes
    public pollingTimer;

    public email;
    public name;
    public phone;

    public cashAvailable;
    public totalSales;
    public maskAccount;
    public account;
    public bankName;
    public bankCode;
    public depositor;
    public isTestServer:boolean;
    //public printer;
    public volume=100; // 0-100

    public serverAddress:string=this.configProvider.getServerAddress();

    public awsS3OCR:string=this.configProvider.getAwsS3OCR();
    public awsS3:string=this.configProvider.getAwsS3();
    public homeJpegQuality=this.configProvider.getHomeJpegQuality();
    public menusInRow=this.configProvider.getMenusInRow();
    public timeout=this.configProvider.getTimeout(); //20 seconds for card cancellation
    public OrdersInPage:number=this.configProvider.getOrdersInPage(); // The number of orders shown in a page

    public userSenderID=this.configProvider.getUserSenderID(); //fcm senderID
    public kakaoTakitShop=this.configProvider.getKakaoTakitShop();////Rest API key
    public kakaoOauthUrl=this.configProvider.getKakaoOauthUrl(); //return url

    public version=this.configProvider.getVersion();

    public accountMaskExceptFront=this.configProvider.getAccountMaskExceptFront();
    public accountMaskExceptEnd=this.configProvider.getAccountMaskExceptEnd();

    public device=this.configProvider.device;
    
    public bootTime;
    public lastTokenSent;
    public registrationId;
    
    public kiosk:boolean=false;
    public lastAutoPrintedPaidOrderNO;
    public lastAutoPrintedcancelOrderNO;
    
    public storeType;

    public isMobile=false;

    constructor(private platform:Platform,private nativeStorage: NativeStorage,
                public loadingCtrl: LoadingController, 
                private alertController:AlertController,
                 //private sqlite: SQLite,
                private configProvider:ConfigProvider){
        console.log("StorageProvider constructor");  
        if(this.serverAddress.endsWith('8000')){
            console.log("test server 8000");
            this.isTestServer = true;     
        }else{
            this.isTestServer = false;
        }

        platform.ready().then(() => {
            this.nativeStorage.getItem("printOn").then((value:string)=>{
                console.log("printOn is "+value+" in storage");
                if(value==null || value==undefined){
                    this.printOn=false;
                }else{
                    this.printOn= (value.toLowerCase() === 'true');
                }
            });
            console.log("printOn is "+this.printOn);
            /*
            if(this.printOn){
                this.nativeStorage.getItem("print").then((value:string)=>{
                console.log("print is "+value+" in storage");
                this.printer= value;
                });
            }else{
                this.printer=undefined;
            }
            */
            this.nativeStorage.getItem("volume").then((value:string)=>{
                console.log("volume is "+value+" in storage");
                if(value==null || value==undefined){
                    this.volume=100;
                }else{
                    this.volume= parseInt(value);
                }
            });   
        });
    }

    reset(){
        this.myshoplist=[];
        this.myshop={}; 
        this.shopInfo=undefined;   
        this.id=undefined;

        this.printOn=false;
        this.amIGotNoti=false;
        this.storeOpen=false;

        this.email=undefined;
        this.name=undefined;
        this.phone=undefined;

        this.cashAvailable=undefined;
        this.totalSales=undefined;
        this.maskAccount=undefined;
        this.account=undefined;
        this.bankName=undefined;
        this.bankCode=undefined;
        this.depositor=undefined;
    }

    decryptValue(identifier,value){
        var key=value.substring(0, 16);
        var encrypt=value.substring(16, value.length);
        console.log("value:"+value+" key:"+key+" encrypt:"+encrypt);
        var decrypted=CryptoJS.AES.decrypt(encrypt,key);
        if(identifier=="id"){ // not good idea to save id here. Please make a function like getId
            this.id=decrypted.toString(CryptoJS.enc.Utf8);
            console.log("save id into storageProvider "+this.id);
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

    shopInfoSet(shopInfo:any){
        console.log("shopInfoSet:"+JSON.stringify(shopInfo));
        this.shopInfo=shopInfo;
    } 

    currentShopname(){
        return this.shopInfo.shopName;
    }

    public userInfoSetFromServer(userInfo:any){
        console.log("userInfoSetFromServer:"+JSON.stringify(userInfo));
        this.email=userInfo.email;
        this.name=userInfo.name;
        this.phone=userInfo.phone;
        this.tourMode=false;
    }

    saveVolume(value:number){
        this.nativeStorage.setItem('volume',value.toString());
        this.volume=value;
        console.log("saveVolume:"+this.volume);
    }

    savepollingInterval(value){
        if(this.pollingInterval!=value){
            this.nativeStorage.setItem('pollingInterval',value);
            //this.pollingInterval=value;
            //console.log("savepollingInterval:"+this.pollingInterval);
            //clearInterval(this.pollingTimer);
            // restart App
            let confirm = this.alertController.create({
                title: '주문정보 요청기간 적용을 위해서는 재시작이 필요합니다.',
                message: '지금 재시작합니다.',
                buttons: [
                    {
                    text: '아니오',
                    handler: () => {
                        console.log('Disagree clicked');
                        return;
                    }
                    },
                    {
                    text: '네',
                    handler: () => {
                        cordova.plugins.restart.restart();
                        return;
                    }
                    }]
                    // 적용을 위해 앱을 다시 시작합니다. 
                });
             confirm.present();
        }
    }

    openLogDB(){
        return new Promise((resolve,reject)=>{
            resolve();
        });

    }

    printOutLogs(){

    }
    
    saveLog(status,orderNO){
    }

    deleteLog(){
    }

    checkPrinted(status,orderNO){ // 마지막으로 출력한 가장 큰숫자인가? 출력이 안될수도 있는가? 
          //DB에 함수 요청 시간을 기록한다.
          //동일 상태에 주문번호가 있는지 확인한다.
               return new Promise((resolve,reject)=>{                    
                   resolve();
               });               
    }

}


