import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { StorageProvider } from '../../providers/storage/storage';
import { LoginProvider } from '../../providers/login/login';
import {LoginMainPage} from '../login-main/login-main';
import { TabsPage } from '../tabs/tabs';
import { ServerProvider } from '../../providers/server/server';

/**
 * Generated class for the ErrorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-error',
  templateUrl: 'error.html',
})
export class ErrorPage {
  isAndroid;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private app:App,
              private nativeStorage: NativeStorage,
              public storageProvider:StorageProvider,
              private serverProvider:ServerProvider,
              public loginProvider:LoginProvider,              
              private platform: Platform) {
        this.isAndroid=platform.is("android");        
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ErrorPage');
    this.isAndroid=this.platform.is("android");        
  }

  exit(){
        console.log("terminate");
        this.platform.exitApp();
  }

  retry(){
        if(this.storageProvider.id==undefined){
                this.nativeStorage.getItem("id").then((value:string)=>{
                        console.log("value:"+value);
                        if(value==null){
                            console.log("id doesn't exist");
                            this.app.getRootNav().setRoot(LoginMainPage); 
                            return;
                        }else{
                            var id=this.storageProvider.decryptValue("id",decodeURI(value));
                            console.log("id:"+id);
                            this.loginWithExistingId();
                        }
                });        
        }else{
            this.loginWithExistingId();
        }
  }

    loginWithExistingId(){
                var id=this.storageProvider.id;
                if(id=="facebook" || id=="kakao"){
                    this.loginProvider.loginSocialLogin(id).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    //save shoplist
                                    console.log("res.email:"+res.email +"res.name:"+res.name);
                                    if(res.userInfo.hasOwnProperty("shopList")){
                                        this.storageProvider.shoplistSet(JSON.parse(res.userInfo.shopList));
                                        this.serverProvider.shopListUpdate();
                                    }
                                    this.storageProvider.emailLogin=false;
                                    this.storageProvider.userInfoSetFromServer(res.userInfo);
                                    console.log("shoplist...:"+JSON.stringify(this.storageProvider.shopList));
                                    this.app.getRootNav().setRoot(TabsPage);
                                }else if(res.result=='failure' && res.result=='invalidId'){
                                    console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                    this.app.getRootNav().setRoot(LoginMainPage);   
                                }else{
                                    console.log("invalid result comes from server-"+JSON.stringify(res));
                                    //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다');
                                    this.app.getRootNav().setRoot(ErrorPage);   
                                }
                            },login_err =>{
                                console.log("move into ErrorPage-"+JSON.stringify(login_err));
                                //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                //this.app.getRootNav().setRoot(ErrorPage);
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
                                    this.app.getRootNav().setRoot(TabsPage);
                                }else{ 
                                    console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                    this.app.getRootNav().setRoot(LoginMainPage);
                                }
                            },login_err =>{
                                console.log(JSON.stringify(login_err));
                                //this.storageProvider.errorReasonSet('로그인 에러가 발생했습니다'); 
                                //this.app.getRootNav().setRoot(ErrorPage);
                        });
                        },(error)=>{
                                console.log("사용자 정보에 문제가 발생했습니다. 로그인 페이지로 이동합니다.");
                                this.app.getRootNav().setRoot(LoginMainPage);
                        });
                }
    }
  
}
