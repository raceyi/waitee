import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {LoginMainPage} from '../pages/login-main/login-main';
import { Network } from '@ionic-native/network';
import { HomePage } from '../pages/home/home';
import { NativeStorage } from '@ionic-native/native-storage';
import { StorageProvider } from '../providers/storage/storage';
import { ServerProvider } from '../providers/server/server';

import {SignupPaymentPage} from '../pages/signup-payment/signup-payment';
import { TabsPage } from '../pages/tabs/tabs';
import { ErrorPage } from '../pages/error/error';
import { LoginProvider } from '../providers/login/login';

declare var cordova:any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  disconnectSubscription;

  constructor(platform: Platform, statusBar: StatusBar,
             splashScreen: SplashScreen,
             private nativeStorage: NativeStorage,
             public storageProvider:StorageProvider,
             private serverProvider:ServerProvider,
             public loginProvider:LoginProvider,
             private network: Network) {
    platform.ready().then(() => {

            this.disconnectSubscription = this.network.onDisconnect().subscribe(() => { 
                console.log('network was disconnected :-( ');
                console.log("rootPage:"+JSON.stringify(this.rootPage));
                if(this.rootPage==undefined){
                    this.nativeStorage.getItem("id").then((value:string)=>{
                        console.log("value:"+value);
                        if(value==null){
                            this.rootPage=LoginMainPage;
                        }else{    
                            console.log("move into ErrorPage");
                            this.rootPage=ErrorPage;
                        }
                    },(err)=>{
                        this.rootPage=LoginMainPage;
                    });
                }       
            });
            console.log("platform.ready...");
            //Please login if login info exists or move into login page
            this.nativeStorage.getItem("id").then((value:string)=>{
                console.log("value:"+value);
                if(value==null){
                    console.log("id doesn't exist");
                    this.nativeStorage.getItem("tutorialShownFlag").then((value:string)=>{
                        console.log("value of tutorialShownFlag:"+value);
                        if(value==null){
                            this.rootPage=LoginMainPage;
                        }
                    },(err)=>{ //expReadFlag doesn't exist because of the first launch of takitUser.
                            console.log("read error "+JSON.stringify(err));
                            this.rootPage=LoginMainPage;
                    });       
               }else{
                console.log("decodeURI(value):"+decodeURI(value));
                var id=this.storageProvider.decryptValue("id",decodeURI(value));
                if(id=="facebook" || id=="kakao"){
                    this.loginProvider.loginSocialLogin(id).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    //save shoplist
                                    console.log("res.email:"+res.userInfo.email +"res.name:"+res.userInfo.name);
                                    if(res.userInfo.hasOwnProperty("shopList")){
                                        this.storageProvider.shoplistSet(JSON.parse(res.userInfo.shopList));
                                        this.serverProvider.shopListUpdate();
                                    }
                                    this.storageProvider.emailLogin=false;
                                    this.storageProvider.userInfoSetFromServer(res.userInfo);
                                    console.log("shoplist...:"+JSON.stringify(this.storageProvider.shopList));
                                    if(!res.userInfo.hasOwnProperty("cashId") || res.userInfo.cashId==null || res.userInfo.cashId==undefined){
                                        console.log("move into signupPaymentPage");
                                        this.rootPage=SignupPaymentPage;
                                    }else{
                                        console.log("move into TabsPage");
                                        this.rootPage=TabsPage;
                                    }
                                }else if(res.result=='failure'&& res.error=='invalidId'){
                                    console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                    this.rootPage=LoginMainPage;   

                                }else{
                                    console.log("invalid result comes from server-"+JSON.stringify(res));
                                    //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다');
                                    this.rootPage=ErrorPage;   
                                }
                            },login_err =>{
                                console.log("move into ErrorPage-"+JSON.stringify(login_err));
                                //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                this.rootPage=ErrorPage;
                    });
                }else{ // email login 
                        this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storageProvider.decryptValue("password",decodeURI(value));
                        this.loginProvider.loginEmail(id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    if(res.userInfo.hasOwnProperty("shopList")){
                                        //save shoplist
                                        this.storageProvider.shoplistSet(JSON.parse(res.userInfo.shopList));
                                        this.serverProvider.shopListUpdate();
                                    }
                                    this.storageProvider.emailLogin=true;
                                    this.storageProvider.userInfoSetFromServer(res.userInfo);
                                    if(!res.userInfo.hasOwnProperty("cashId") || res.userInfo.cashId==null || res.userInfo.cashId==undefined){
                                        console.log("move into signupPaymentPage");
                                        this.rootPage=SignupPaymentPage;
                                    }else{
                                        console.log("move into TabsPage");
                                        this.rootPage=TabsPage;
                                    }
                                }else{ 
                                    console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                    this.rootPage=LoginMainPage;
                                }
                            },login_err =>{
                                console.log(JSON.stringify(login_err));
                                //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                this.rootPage=ErrorPage;
                        });
                        },(error)=>{
                                console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                this.rootPage=LoginMainPage;
                        });
                }
               }
            },(error)=>{
                console.log("id doesn't exist");
                    this.rootPage=LoginMainPage;
            });

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

