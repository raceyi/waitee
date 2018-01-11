import { Component } from '@angular/core';
import { IonicPage, NavController,Platform, NavParams ,AlertController } from 'ionic-angular';
import {SignupPaymentPage} from '../signup-payment/signup-payment';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {StorageProvider} from '../../providers/storage/storage';

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
  buttonColor:any={'color':'#6441a5'};
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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private iab: InAppBrowser,
              private platform:Platform,
              private alertCtrl:AlertController,
              public storageProvider:StorageProvider) {
  }

  checked(){
    console.log("checked comes");
    if(!this.agreement){
        this.agreement=true;
        this.buttonColor={'color':'white',
                          'background-color':'#6441a5'
                        };
    }else{
        this.navCtrl.push(SignupPaymentPage);
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
        this.color1="#6441a5";
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
        this.color2="#6441a5";
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
        this.color3="#6441a5";
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
        this.color4="#6441a5";
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
        this.color5="#6441a5";
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
  this.mobileAuth().then((res:any)=>{
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

  mobileAuth(){
      console.log("mobileAuth");
    return new Promise((resolve,reject)=>{
      // move into CertPage and then 
      if(this.platform.is("android")){
            this.browserRef=this.iab.create(this.storageProvider.certUrl,"_blank" ,'toolbar=no');
      }else{ // ios
            console.log("ios");
            this.browserRef=this.iab.create(this.storageProvider.certUrl,"_blank" ,'location=no,closebuttoncaption=종료');
      }
              this.browserRef.on("exit").subscribe((event)=>{
                  console.log("InAppBrowserEvent(exit):"+JSON.stringify(event)); 
                  this.browserRef.close();
              });
              this.browserRef.on("loadstart").subscribe((event:InAppBrowserEvent)=>{
                  console.log("InAppBrowserEvent(loadstart):"+String(event.url));
                  if(event.url.startsWith("https://takit.biz/oauthSuccess")){ // Just testing. Please add success and failure into server 
                        console.log("cert success");
                        var strs=event.url.split("userPhone=");    
                        if(strs.length>=2){
                            var nameStrs=strs[1].split("userName=");
                            if(nameStrs.length>=2){
                                var userPhone=nameStrs[0];
                                var userSexStrs=nameStrs[1].split("userSex=");
                                var userName=userSexStrs[0];
                                var userAgeStrs=userSexStrs[1].split("userAge=");
                                var userSex=userAgeStrs[0];
                                var userAge=userAgeStrs[1];
                                console.log("userPhone:"+userPhone+" userName:"+userName+" userSex:"+userSex+" userAge:"+userAge);
                                let body = JSON.stringify({userPhone:userPhone,userName:userName,userSex:userSex,userAge:userAge});
                                resolve(body);
                                /*
                                this.serverProvider.post(this.storageProvider.serverAddress+"/getUserInfo",body).then((res:any)=>{
                                    console.log("/getUserInfo res:"+JSON.stringify(res));
                                    if(res.result=="success"){
                                        // forward into cash id page
                                        resolve(res);
                                    }else{
                                        // change user info
                                        //    
                                        reject("invalidUserInfo");
                                    }
                                },(err)=>{
                                    if(err=="NetworkFailure"){
                                            let alert = this.alertCtrl.create({
                                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                    }
                                    reject(err);
                                });
                                */
                            } 
                            ///////////////////////////////
                        }
                        this.browserRef.close();
                        return;
                  }else if(event.url.startsWith("https://takit.biz/oauthFailure")){
                        console.log("cert failure");
                        this.browserRef.close();
                         reject();
                        return;
                  }
              });
    });
  }
}
