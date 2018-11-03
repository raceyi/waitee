import {Component,EventEmitter,ViewChild} from "@angular/core";
import {Content} from 'ionic-angular';
import {NavController,NavParams} from 'ionic-angular';
import {EmailProvider} from '../../providers/LoginProvider/email-provider';
import {Platform,AlertController} from 'ionic-angular';
import {ErrorPage} from '../error/error';
import{ShopTablePage} from '../shoptable/shoptable';
import{SelectorPage} from '../selector/selector';
import {UserSecretPage} from '../usersecret/usersecret';
import {StorageProvider} from '../../providers/storageProvider';
import { NativeStorage } from '@ionic-native/native-storage';
import { EditMenuPage } from '../edit-menu-page/edit-menu-page';

@Component({
  selector: 'page-login',  
  templateUrl: 'login.html',
})

export class LoginPage {
    password:string;
    email:string;
    emailHide:boolean=true;
    @ViewChild('loginPage') loginPageRef: Content;
    scrollTop;
    tourModeSignInProgress:boolean=false;

  constructor(private navController: NavController, private navParams: NavParams,
                private emailProvider:EmailProvider,
                private storageProvider:StorageProvider,
                private nativeStorage: NativeStorage,
                private platform:Platform,
                private alertController:AlertController){

  }
 
  ionViewDidLoad(){
        console.log("Login page did enter");
        let dimensions = this.loginPageRef.getContentDimensions();
        this.scrollTop=dimensions.scrollTop;
        this.storageProvider.login=true;
        this.storageProvider.navController=this.navController;
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
                //this.navController.setRoot(ShopTablePage);
                this.navController.setRoot(EditMenuPage);
            }else{ 
                console.log("multiple shops");
                this.navController.setRoot(SelectorPage);
            }
        }
  }
     
  dummyHandler(id,fbProvider,accessToken){
      console.log("dummyHandler called");
      return new Promise((resolve, reject)=>{
          console.log("dummyHandler with id "+id);
            resolve({id:id,accessToken:accessToken});
      });
  }


  dummyHandlerKakao(id){
      console.log("dummyHandler called");
      return new Promise((resolve, reject)=>{
          console.log("dummyHandler with id "+id);
          resolve({id:id});
      });
  }

  emailLogin(event){
      if(!this.email && this.email.length==0){
          
              let alert = this.alertController.create({
                        title: '이메일을 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
          return;
      }
      if(!this.password || this.password.length==0){
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

  emailReset(event){
      console.log("Please send an email with reset password");
  }

  emailLoginSelect(event){
      this.emailHide=!this.emailHide;      
  }

  tourMode(){
    console.log("tourMode");
          if(!this.tourModeSignInProgress){
            this.tourModeSignInProgress=true;
      
            this.emailProvider.EmailServerLogin(this.storageProvider.tourEmail,this.storageProvider.tourPassword).then((res:any)=>{
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
                    this.storageProvider.tourMode=true;
                    // show user cashId
                    this.storageProvider.myshoplist=JSON.parse(res.shopUserInfo.myShopList);
                    this.storageProvider.myshop=this.storageProvider.myshoplist[0];
                    this.storageProvider.name="타킷주식회사";
                    this.storageProvider.email="help@takit.biz";
                    this.storageProvider.phone="05051703636";
                    this.storageProvider.cashAvailable=" ";
                    this.storageProvider.bankName="농협";
                    this.storageProvider.maskAccount="301****363621";
                    this.storageProvider.depositor="타킷주식회사";
                    this.tourModeSignInProgress=false;
                    //this.navController.push(ShopTablePage);
                    this.navController.setRoot(ShopTablePage);
                }else{
                    this.tourModeSignInProgress=false;
                    console.log("hum... tour id doesn't work.");
                }
            },(err)=>{
                this.tourModeSignInProgress=false;
                let alert = this.alertController.create({
                    title: '네트웍 상태를 확인하신후 다시 시도해 주시기 바랍니다.',
                    buttons: ['OK']
                });
                alert.present();
            });
          }
  }

}
