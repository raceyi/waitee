import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,Platform } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../../providers/storage/storage';
import {LoginProvider} from '../../providers/login/login';
import {ErrorPage} from '../error/error';
import {HomePage} from '../home/home';
import {SelectorPage} from '../selector/selector';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

    password:string;
    email:string;
    scrollTop;
    tourModeSignInProgress:boolean=false;

  constructor(private navController: NavController, private navParams: NavParams,
                private emailProvider:LoginProvider,
                private storageProvider:StorageProvider,
                private nativeStorage: NativeStorage,private platform:Platform,
                private alertController:AlertController){
      console.log("LoginPage construtor");
  }
 
  ionViewDidLoad(){

  }

  shoplistHandler(userinfo){
      console.log("myshoplist:"+userinfo.myShopList);
        if(!userinfo.hasOwnProperty("myShopList")|| userinfo.myShopList==null){
            //this.storageProvider.errorReasonSet('등록된 상점이 없습니다.');
            this.navController.setRoot(ErrorPage);
        }else{
            this.storageProvider.myshoplist=JSON.parse(userinfo.myShopList);
            this.storageProvider.userInfoSetFromServer(userinfo);
            if(this.storageProvider.myshoplist.length==1){
                console.log("move into ShopTablePage");
                this.storageProvider.myshop=this.storageProvider.myshoplist[0];
                this.navController.setRoot(HomePage);
            }else{ 
                console.log("multiple shops");
                this.navController.setRoot(SelectorPage);
            }
        }
  }

  emailLogin(event){
      if(this.email.length==0){
          
              let alert = this.alertController.create({
                        title: '이메일을 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
          return;
      }
      if(this.password.length==0){
                let alert = this.alertController.create({
                        title: '비밀번호를 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
            return;
      }

      console.log('emailLogin comes email:'+this.email+" password:"+this.password);          
      this.emailProvider.EmailServerLogin(this.email,this.password).then((res:any)=>{
                                console.log("emailLogin-login page:"+JSON.stringify(res));
                                if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                    let alert = this.alertController.create({
                                                    title: '앱버전을 업데이트해주시기 바랍니다.',
                                                    subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                                    buttons: ['OK']
                                                });
                                        alert.present();
                                }
                                if(res.result=="success"){
                                    var encrypted:string=this.storageProvider.encryptValue('id',this.email);
                                    this.nativeStorage.setItem('id',encodeURI(encrypted));
                                    encrypted=this.storageProvider.encryptValue('password',this.password);
                                    this.nativeStorage.setItem('password',encodeURI(encrypted));
                                    this.shoplistHandler(res.shopUserInfo);   
                                }else if(res.result=='invalidId'){
                                    let alert = this.alertController.create({
                                                title: '회원 정보가 일치하지 않습니다.',
                                                buttons: ['OK']
                                            });
                                            alert.present().then(()=>{
                                              console.log("alert is done");
                                            });
                                }else{
                                    console.log("invalid result comes from server-"+JSON.stringify(res));
                                    let alert = this.alertController.create({
                                        title: '로그인 에러가 발생했습니다',
                                        subTitle: '다시 시도해 주시기 바랍니다.',
                                        buttons: ['OK']
                                    });
                                    alert.present();
                                }
                            },login_err =>{
                                console.log(JSON.stringify(login_err));
                                let alert = this.alertController.create({
                                        title: '로그인 에러가 발생했습니다',
                                        subTitle: '네트웍 상태를 확인하신후 다시 시도해 주시기 바랍니다.',
                                        buttons: ['OK']
                                    });
                                    alert.present();
                    }); 
  }

}
