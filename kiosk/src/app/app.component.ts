import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../providers/storage/storage';
import {LoginProvider} from '../providers/login/login';

import { LoginPage } from '../pages/login/login';
import { ErrorPage } from '../pages/error/error';
import { HomePage } from '../pages/home/home';
import {SelectorPage} from '../pages/selector/selector';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //rootPage:any = HomePage;
  rootPage:any;

  constructor(platform: Platform,
              private nativeStorage: NativeStorage, 
              statusBar: StatusBar, 
              private storageProvider:StorageProvider,
              public login:LoginProvider,
              splashScreen: SplashScreen) {

    platform.ready().then(() => {
            if(platform.is("cordova")){
                this.nativeStorage.getItem("id").then((value:string)=>{
                    console.log("value:"+value);
                    if(value==null){
                    console.log("id doesn't exist");
                    this.rootPage=LoginPage;
                    return;
                    }

                    console.log("decodeURI(value):"+decodeURI(value));
                    var id=this.storageProvider.decryptValue("id",decodeURI(value));
                        this.nativeStorage.getItem("password").then((value:string)=>{
                            var password=this.storageProvider.decryptValue("password",decodeURI(value));
                            this.login.EmailServerLogin(id,password).then((res:any)=>{
                                    console.log("MyApp:"+JSON.stringify(res));
                                    if(res.result=="success"){
                                        this.shoplistHandler(res.shopUserInfo);
                                    }else if(res.result=='invalidId'){
                                        //console.log("You have no right to access this app");
                                        console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                        this.rootPage=LoginPage; 
                                    }else{
                                        //console.log("invalid result comes from server-"+JSON.stringify(res));
                                        //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                        this.rootPage=ErrorPage;   
                                    }
                                },login_err =>{
                                    //console.log(JSON.stringify(login_err));
                                    //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                    this.rootPage=ErrorPage;
                            });
                        });
                },err=>{
                    console.log("id doesn't exist. move into LoginPage");
                    this.rootPage=LoginPage;
                });
            }else{
                    this.login.EmailServerLogin("kalen.lee@takit.biz","waitee").then((res:any)=>{
                            console.log("MyApp:"+JSON.stringify(res));
                            if(res.result=="success"){
                                //this.shoplistHandler(res.shopUserInfo);
                                this.storageProvider.myshop={takitId:"세종대@더큰도시락",manager:true,GCMNoti:"on"};
                                this.rootPage=HomePage;
                            }else if(res.result=='invalidId'){
                                //console.log("You have no right to access this app");
                                console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                this.rootPage=LoginPage; 
                            }else{
                                //console.log("invalid result comes from server-"+JSON.stringify(res));
                                //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                this.rootPage=ErrorPage;   
                            }
                        },login_err =>{
                            //console.log(JSON.stringify(login_err));
                            //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                            this.rootPage=ErrorPage;
                        });
            }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }


    shoplistHandler(userinfo:any){
        console.log("myshoplist:"+userinfo.myShopList);
        if(!userinfo.hasOwnProperty("myShopList")|| userinfo.myShopList==null){
            //this.storageProvider.errorReasonSet('등록된 상점이 없습니다.');
            this.rootPage=ErrorPage;
        }else{
             this.storageProvider.myshoplist=JSON.parse(userinfo.myShopList);
             this.storageProvider.userInfoSetFromServer(userinfo);
             if(this.storageProvider.myshoplist.length==1){
                console.log("move into ShopTablePage");
                this.storageProvider.myshop=this.storageProvider.myshoplist[0];
                this.rootPage=HomePage;
             }else{ 
                console.log("multiple shops");
                this.rootPage=SelectorPage;
             }
        }
    }
}

