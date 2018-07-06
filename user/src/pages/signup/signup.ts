import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController,Platform, NavParams ,AlertController } from 'ionic-angular';
import {SignupPaymentPage} from '../signup-payment/signup-payment';
import {LoginMainPage} from '../login-main/login-main';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { NativeStorage } from '@ionic-native/native-storage';
import {LoginProvider} from '../../providers/login/login';

declare var plugins:any;
declare var cordova:any;
/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  email:string;
  password:string;
  passwordConfirm:string;
  agreement:boolean=false;
  buttonColor:any={'color':'#FF5F3A'};
  color1="#4a4a4a"; 
  color2="#4a4a4a";
  color3="#4a4a4a"; 
  color4="#4a4a4a";
  color5="#4a4a4a"; 

  userAgreementShown=false;        //1
  userInfoShown=false;             //2
  transactionAgreementShown=false; //3
  locationShown=false;             //4
  pictureShown=false;              //5

  currentShown;  //undefined

  authVerified:boolean=false;
  name:string;  // It comes from mobile auth.
  phone:string; // It comes from mobile auth.
  sex:string;
  birthYear:string;
  browserRef;

  country:string="82"; // So far, only Korea is available.
  
  emailLogin:boolean=false;
  refId:string;
  loginMethod:string;

  signupInProgress:boolean=false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private iab: InAppBrowser,
              private platform:Platform,
              private alertCtrl:AlertController,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              private loginProvider:LoginProvider,
              private nativeStorage: NativeStorage,
              private ngZone:NgZone) {
    
    console.log("login:"+navParams.get("login"));
    console.log(navParams.get("email"));
    console.log(this.platform.is("android"));
    
    if(navParams.get("login")=="email"){
        this.emailLogin=true;
        if(!navParams.get("email") && this.platform.is("android")){ // no email info given
          console.log("get accounts under android");
          var permissions = cordova.plugins.permissions;
          permissions.hasPermission(permissions.GET_ACCOUNTS,(status)=> {
            if (status.hasPermission ) {
              console.log("Yes :D ");
              plugins.DeviceAccounts.getEmail((info)=>{
                this.ngZone.run(()=>{
                  this.email=info;
                });
              });
            }
            else {
              console.warn("No :( ");
              permissions.requestPermission(permissions.GET_ACCOUNTS,(status)=>{
                if( status.hasPermission ){
                    console.log("call DeviceAccounts");
                    plugins.DeviceAccounts.getEmail((info)=>{
                      console.log("info:"+JSON.stringify(info));
                      this.ngZone.run(()=>{
                        this.email=info;
                      });
                  }); 
                }
              },(err)=>{

              });
            }
          },(err)=>{

          });
        }
    }

    if(navParams.get("login")=="facebook"){
        this.refId=navParams.get("id");
        if(navParams.get("email")){
          this.email=navParams.get("email");
        }
    }else if(navParams.get("login")=="kakao"){
        this.refId=navParams.get("id");
    }

    this.loginMethod=navParams.get('login');

//    this.paswordGuide="영문대문자,영문소문자,특수문자,숫자 중 3개 이상선택, 8자리 이상으로 구성하세요.";
//    this.paswordMismatch="비밀번호가 일치하지 않습니다.";
  }

  checked(){
    console.log("checked comes");
    if(!this.agreement){
        this.agreement=true;
        this.buttonColor={'color':'white',
                          'background-color':'#FF5F3A'
                        };
    }else{
        this.signup();
        //this.navCtrl.push(SignupPaymentPage);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  show(title){
    console.log(title+" comes");

    if(title=="1" && this.currentShown=="1"){
        this.color1="#4a4a4a";
        this.userAgreementShown=false; 
    }else if(title=="2" && this.currentShown=="2"){
        this.color2="#4a4a4a";
        this.userInfoShown=false;       
    }else if(title=="3" && this.currentShown=="3"){
        this.color3="#4a4a4a";
        this.transactionAgreementShown=false; 
    }else if(title=="4" && this.currentShown=="4"){
        this.color4="#4a4a4a";
        this.locationShown=false;       
    }else if(title=="5" && this.currentShown=="5"){
        this.color5="#4a4a4a";
        this.pictureShown=false; 
    }else if(title=="1"){
        this.color1="#FF5F3A";
        this.color2="#4a4a4a";
        this.color3="#4a4a4a";
        this.color4="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=true;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=false;             //4
        this.pictureShown=false;              //5
        this.currentShown="1";
    }else if(title=="2"){
        this.color2="#FF5F3A";
        this.color1="#4a4a4a";
        this.color3="#4a4a4a";
        this.color4="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=true;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=false;             //4
        this.pictureShown=false;              //5
        this.currentShown="2";
    }else if(title=="3"){
        this.color3="#FF5F3A";
        this.color1="#4a4a4a";
        this.color2="#4a4a4a";
        this.color4="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=true; //3
        this.locationShown=false;             //4
        this.pictureShown=false;              //5  
        this.currentShown="3";
    }else if(title=="4"){
        this.color4="#FF5F3A";
        this.color1="#4a4a4a";
        this.color2="#4a4a4a";
        this.color3="#4a4a4a";
        this.color5="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=true;             //4
        this.pictureShown=false;              //5 
        this.currentShown="4";               
    }else if(title=="5"){
        this.color5="#FF5F3A";
        this.color1="#4a4a4a";
        this.color2="#4a4a4a";
        this.color3="#4a4a4a";
        this.color4="#4a4a4a";
        this.userAgreementShown=false;         //1
        this.userInfoShown=false;             //2
        this.transactionAgreementShown=false; //3
        this.locationShown=false;             //4
        this.pictureShown=true;              //5
        this.currentShown="5";                        
    }
  }

  back(){
    this.navCtrl.pop();
  }

phoneAuth(){
  this.serverProvider.mobileAuth().then((res:any)=>{
      console.log("[phoneAuth]res:"+JSON.stringify(res));
      this.authVerified=true;
      this.phone=res.userPhone;
      this.sex=res.userSex;
      this.birthYear=res.userAge;
      this.name=res.userName;
      console.log("sex:"+this.sex+"birthYear:"+this.birthYear+"name:"+this.name+" phone:"+this.phone);
  },(err)=>{
      console.log("[phoneAuth] err:"+JSON.stringify(err));
  });  
}

  validateEmail(email){   //http://www.w3resource.com/javascript/form/email-validation.php
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        return (true);
      }
      return (false);
  }

  passwordValidity(password){
    var number = /\d+/.test(password);
    var smEng = /[a-z]+/.test(password);
    var bigEng= /[A-Z]+/.test(password);
    var special = /[^\s\w]+/.test(password);

    if(number && smEng && bigEng){
      return true;
    }
    else if(number && smEng && special){
      return true;
    }
    else if(bigEng && special && special){
      return true;
    }
    else if(bigEng && special && special){
      return true;
    }
    else{
      //this.paswordGuide = "영문대문자,영문소문자,특수문자,숫자 중 3개 이상 선택, 8자리 이상으로 구성하세요";
      return false;
    }
  }

  signup(){
      if(this.signupInProgress)
          return;
          
      //check email
      if(!this.validateEmail(this.email)){
          let alert = this.alertCtrl.create({
                    title: '정상 이메일을 입력해주시기 바랍니다.',
                    buttons: ['OK']
                });
                alert.present();
          return;
      }
     //check password if necessary
     if(this.emailLogin){
        if(!this.passwordValidity(this.password)){
              //this.paswordGuideHide=false;
              let alert = this.alertCtrl.create({
                        title: '영문대문자,영문소문자,특수문자,숫자 중 3개 이상 선택, 8자리 이상으로 구성하세요',
                        buttons: ['OK']
                    });
                    alert.present();
              return;
        }
        if(this.password!==this.passwordConfirm){
              let alert = this.alertCtrl.create({
                        title: '비밀번호가 일치하지 않습니다.',
                        buttons: ['OK']
                    });
                    alert.present();
              return;
        }
     } 

     if(!this.authVerified){
              let alert = this.alertCtrl.create({
                        title: '휴대폰 본인 인증을 수행해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
     }
     console.log("loginMethod:"+this.loginMethod);
     if(this.loginMethod=="facebook" || this.loginMethod=="kakao"){
                console.log("call serverSignup");
                this.signupInProgress=true;
                this.loginProvider.serverSignup(this.refId,this.name,this.email,this.country,this.phone,this.sex,this.birthYear,false,"","IncomeDeduction").then(
                (result:any)=>{
                    // move into home page.  
                    console.log("result..:"+JSON.stringify(result));
                    var serverCode:string=result.result;
                    if(parseFloat(result.version)>parseFloat(this.storageProvider.version)){
                            let alert = this.alertCtrl.create({
                                            title: '앱버전을 업데이트해주시기 바랍니다.',
                                            subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                            buttons: ['OK']
                                        });
                                alert.present();
                    }
                    if(serverCode=="success"){
                        var encrypted:string=this.storageProvider.encryptValue('id',this.loginMethod);// save facebook id 
                        this.nativeStorage.setItem('id',encodeURI(encrypted));
                        this.storageProvider.shopList=[];
                        this.storageProvider.userInfoSet(this.email,this.name,this.phone,false,"","IncomeDeduction",result.recommends);
                        this.navCtrl.setRoot(SignupPaymentPage,{email:this.email,name:this.name,phone:this.phone});
                    }else  if(serverCode=="duplication"){ // result.result=="exist"
                        let alert = this.alertCtrl.create({
                            title: '이미존재하는 아이디입니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                        this.navCtrl.setRoot(LoginMainPage);
                    }else{
                        this.signupInProgress=false;
                        console.log("unknown result:"+serverCode);
                    }
                },(error)=>{ 
                        this.signupInProgress=false;
                        let alert = this.alertCtrl.create({
                            title: '서버로부터의 응답이 없습니다. 네트웍상태를 확인해주시기 바랍니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                });
     }else if(this.loginMethod=="email"){
            this.signupInProgress=true;
            this.loginProvider.emailServerSignup(this.password,this.name,this.email,this.country,this.phone,this.sex,this.birthYear,false,"","IncomeDeduction").then( 
            (result:any)=>{
                    if(parseFloat(result.version)>parseFloat(this.storageProvider.version)){
                            let alert = this.alertCtrl.create({
                                            title: '앱버전을 업데이트해주시기 바랍니다.',
                                            subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                            buttons: ['OK']
                                        });
                                alert.present();
                    }
                    // move into home page.  
                    var output:string=result.result;
                    if(output=="success"){
                        var encrypted:string=this.storageProvider.encryptValue('id',this.email);// save kakao id 
                        this.nativeStorage.setItem('id',encodeURI(encrypted));
                        encrypted=this.storageProvider.encryptValue('password',this.password);// save email id 
                        this.nativeStorage.setItem('password',encodeURI(encrypted));
                        this.storageProvider.shopList=[];
                        this.storageProvider.emailLogin=true;
                        this.storageProvider.userInfoSet(this.email,this.name,this.phone,false,"","IncomeDeduction",result.recommends);
                        this.navCtrl.setRoot(SignupPaymentPage,{email:this.email,name:this.name,phone:this.phone,password:this.password});
                    }else if(output == "duplication"){ // result.result=="exist"
                        let alert = this.alertCtrl.create({
                            title: '이미존재하는 아이디입니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                        this.navCtrl.setRoot(LoginMainPage);
                    }else{ //result.result=="exist"
                        console.log("unknown result:"+output);
                        this.signupInProgress=false;
                        let alert = this.alertCtrl.create({
                            title: '가입에 실패했습니다.',
                            subTitle: output,
                            buttons: ['OK']
                        });
                        alert.present();
                    }
                  },(error)=>{
                    this.signupInProgress=false;
                    let alert = this.alertCtrl.create({
                            title: '서버로부터의 응답이 없습니다. 네트웍상태를 확인해주시기 바랍니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                });
     } 
  }
   
}
