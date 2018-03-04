import { HttpClient } from '@angular/common/http';
import { Platform ,AlertController} from 'ionic-angular';
import { Injectable } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
var gWalletPage;

/*
  Generated class for the CardProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CardProvider {
  done:boolean=false;
  browserRef;

  constructor(public http: HttpClient,
              private platform:Platform,  
              private alertController:AlertController,              
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              private iab: InAppBrowser) {
    console.log('Hello CardProvider Provider');
    gWalletPage=this;    
  }

///////////////////////////////////////////////////////////
   registerCard(){
    return new Promise((resolve,reject)=>{
    this.done=false;
    let customer_uid=this.storageProvider.email+'_'+new Date().getTime();
    console.log("customer_uid:"+customer_uid);
    let machant_uid='merchant_' + new Date().getTime();
    console.log("merchant_uid:"+machant_uid);
    let param={
            pay_method : 'card', // 'card'만 지원됩니다.
            merchant_uid : machant_uid, // 결제건별로 고유한 값을 지정합니다.
            name : '최초인증결제',
            amount : 10, // 빌링키 발급
            customer_uid : customer_uid, //customer_uid 파라메터가 있어야 빌링키 발급을 시도합니다. 한번 등록된 값을 가지고 결제를 수행함으로 고객의 등록카드별로 다른값을 사용하시기 바랍니다.
            buyer_email : 'iamport@siot.do',
            buyer_name : '아임포트',
            buyer_tel : '02-1234-1234'
        }

    const redirectUrl = this.storageProvider.authReturnUrl;//It brings about load error. Please change it with your server address
    let localfile;
    if(this.platform.is('android')){
        console.log("android");
        localfile='file:///android_asset/www/assets/iamport.html';
    }else if(this.platform.is('ios')){
        console.log("ios");
        localfile='assets/iamport.html';
    }
    if(this.platform.is("android")){
        this.browserRef=this.iab.create(localfile,"_blank" ,'toolbar=no,location=no');
    }else{ // ios
        console.log("ios");
        this.browserRef=this.iab.create(localfile,"_blank" ,'location=no,closebuttoncaption=종료');
    }
    this.browserRef.on("loadstart").subscribe(function (e) {
        if (e.url.startsWith(redirectUrl)) {
            if(gWalletPage.browserRef!=undefined){
                console.log("call gBrowserRef.close");
                gWalletPage.browserRef.close(); 
            }else
                console.log("this.browserRef is undefined");
            gWalletPage.done=true;
            console.log("result:"+e.url);
            if(e.url.includes("imp_success=true")){
                console.log("cert success");
                let strs=e.url.split("imp_uid=");
                let strs1=strs[1].split("&");
                console.log("strs[1]:"+strs[1]);
                console.log("strs1[1]:"+strs1[1]); 
                resolve({customer_uid:customer_uid,imp_uid:strs1[0]});
            }else{
                console.log("cert failure");            
                reject('카드 등록에 실패하였습니다.');
            }
        }
    });
    this.browserRef.on("loaderror").subscribe((event)=>{
        console.log("loaderror:"+event.url);
        gWalletPage.done=true; // Please change redirectUrl with your server address to prevent loaderror;
        if(gWalletPage.browserRef!=undefined){
                console.log("call this.browserRef.close");
                gWalletPage.browserRef.close();
        }
    });
    this.browserRef.on("loadstop").subscribe((event)=>{
        console.log("loadstop event comes "+event.url);
        if(gWalletPage.done){ 
            if(gWalletPage.browserRef!=undefined){
                console.log("close browser");
                gWalletPage.browserRef.close();
            }else
                console.log("browserRef undefined");            
            return;
        }
        let url:string=event.url;
        if(url.endsWith('iamport.html')){ 
            const inlineCallback = `(rsp) => {
                if( rsp.success ) {
                    location.href = '${redirectUrl}?imp_success=true&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid;
                } else {
                    location.href = '${redirectUrl}?imp_success=false&imp_uid='+rsp.imp_uid+'&merchant_uid='+rsp.merchant_uid+'&error_msg='+rsp.error_msg;
                }
            }`;
            const iamport_script = `IMP.request_pay(${JSON.stringify(param)}, ${inlineCallback})`;
            this.browserRef.executeScript({
                code : iamport_script
            });
        }
    });
    this.browserRef.on("exit").subscribe(
        (e) => {
            console.log("gWalletPage.done:"+gWalletPage.done)
            if(!gWalletPage.done){
                reject('카드 등록을 사용자가 취소하였습니다');
            }else{
                console.log("browser close");
            }
        }
    );
    });
  }

  addCard(){
    return new Promise((resolve,reject)=>{
      this.registerCard().then((param)=>{
        console.log("param:"+JSON.stringify(param));
        this.serverProvider.post(this.storageProvider.serverAddress+"/addPayInfo", param).then((res:any)=>{
                if(res.result=="success"){
                    this.storageProvider.updatePayInfo(res.payInfo);
                    resolve();
                }
            },(err=>{
                    if(err=="NetworkFailure"){
                                let alert = this.alertController.create({
                                    title: "서버와 통신에 문제가 있습니다.",
                                    buttons: ['OK']
                                });
                                alert.present();
                    }else{
                        console.log("Hum...getPayMethod-HttpError");
                                let alert = this.alertController.create({
                                    title: "카드추가에 실패했습니다.",
                                    buttons: ['OK']
                                });
                                alert.present();
                    }
                    reject();
            }));
      },(err)=>{
                let alert = this.alertController.create({
                    title: err,
                    buttons: ['OK']
                });
                alert.present();
                reject();
      });
    });
  }
  
  removeCard(i){
        this.serverProvider.post(this.storageProvider.serverAddress+"/removePayInfo", {customer_uid:this.storageProvider.payInfo[i].customer_uid}).then((res:any)=>{
            if(res.result=="success"){
                this.storageProvider.updatePayInfo(res.payInfo);
            }
        },(err=>{
                if(err=="NetworkFailure"){
                            let alert = this.alertController.create({
                                title: "서버와 통신에 문제가 있습니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                 }else{
                     console.log("Hum...getPayMethod-HttpError");
                            let alert = this.alertController.create({
                                title: "카드삭제에 실패했습니다.",
                                buttons: ['OK']
                            });
                            alert.present();
                 }
        }));
    
  }

}
