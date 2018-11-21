import {Injectable} from '@angular/core';
import {Platform ,NavController,LoadingController,AlertController} from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import * as CryptoJS from 'crypto-js';
import {ConfigProvider} from './configProvider';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

declare var cordova:any;

@Injectable()
export class StorageProvider{
    public db:SQLiteObject;

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
    public IPAddress; //소리 알림 IP주소 
    public lastPollResponseTime; //마지막으로 서버로 부터 응답을 받은 시간
    public lastPollRequestTime; //마지막으로 서버로 요청을한 시간

    constructor(private platform:Platform,private nativeStorage: NativeStorage,
                public loadingCtrl: LoadingController, 
                private alertController:AlertController,
                 private sqlite: SQLite,
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

            this.nativeStorage.getItem("IPAddress").then((value:string)=>{
                console.log("IPAddress is "+value+" in storage");
                if(value==null || value==undefined){

                }else{
                    this.IPAddress=value;
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

    saveIPAddress(value){
            this.nativeStorage.setItem('IPAddress',value);
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
            var options={
                    name: "takitLog.db",
                    location:'default'
            };
            console.log("call create function")            
            this.sqlite.create(options)
            .then((db: SQLiteObject) => {  //DB 버전을 넣어서 해결하자. 앱을 다시 설치할 경우 user version은 변경되지 않는다. 사용할수 없는 방법임!
                this.db=db;
                this.db.executeSql("create table if not exists printlogs(orderInfo VARCHAR(32) primary key)",[]).then(()=>{
                    console.log("success to create cart table");
                }).catch(e => {
                    console.log("fail to create table"+JSON.stringify(e));
                    reject(e); // just ignore it if it exists. hum.. How can I know the difference between error and no change?
                });
            }).catch(e =>{
                console.log("fail to open database"+JSON.stringify(e));
                reject(e);
            });
        });

    }

    printOutLogs(){
            var queryString='SELECT * FROM printlogs';
                                this.db.executeSql(queryString,[]).then((resp)=>{ // What is the type of resp? 
            console.log("query result:"+JSON.stringify(resp));
            var output=[];
            if(resp.rows.length>=1){
                for(var i=0;i<resp.rows.length;i++){
                    console.log("item("+i+")"+JSON.stringify(resp.rows.item(i)));
                    let time=new Date(resp.rows.item(i).time);
                    console.log(resp.rows.item(i).orderInfo);
                } 
            }else if(resp.rows.length==0){
                console.log("!!!! no log info !!!");
            }   
        },(e) => { 
                console.log("DB error "+JSON.stringify(e));
        });

    }
    
    saveLog(status,orderNO){
        return new Promise((resolve,reject)=>{           
                    let queryString:string;
                    let time= new Date();

                    let params=[status+'_'+orderNO];

                    console.log("!!!!params:"+JSON.stringify(params));

                    queryString="INSERT INTO printlogs(orderInfo) VALUES(?)";
                    console.log("query:"+queryString);
                    this.db.executeSql(queryString,params).then((resp)=>{
                        console.log("[saveLog]resp:"+JSON.stringify(resp));
                        resolve();
                    },(e) => {
                        console.log("saveLog error:"+JSON.stringify(e));
                        //duplicate error인지를 확인하자.
                        if(e.code==6){
                            console.log("duplicate error");
                            reject("duplicated");
                        }else
                            reject(e);
                    });
        });
    }

    deleteLog(){
        return new Promise((resolve,reject)=>{           
        
            console.log("deleteLog");
            let queryString:string;
            queryString="DELETE FROM printlogs";
            console.log("query:"+queryString);
            this.db.executeSql(queryString).then((resp)=>{
                console.log("[deleteLog]resp:"+JSON.stringify(resp));
                resolve();
            }).catch(e => {
                console.log("deleteLog error:"+JSON.stringify(e));
                reject();
            });
        });   
    }


}


