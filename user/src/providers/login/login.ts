import { Injectable } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import {Platform,AlertController} from 'ionic-angular';
import {StorageProvider} from '../storage/storage';
import {Http,Headers} from '@angular/http';
import { AppAvailability } from '@ionic-native/app-availability';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { NativeStorage } from '@ionic-native/native-storage';
import { HttpClient ,HttpHeaders} from '@angular/common/http';

declare var KakaoTalk:any;

/*
  Generated class for the LoginProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LoginProvider {

  browserRef;
  notice;
  
  constructor(public fb: Facebook,private platform:Platform
      ,public storageProvider:StorageProvider,
      private nativeStorage: NativeStorage,
      private appAvailability: AppAvailability,
      private alertCtrl:AlertController
      ,private iab: InAppBrowser,private httpClient: HttpClient) {
    console.log('Hello LoginProvider Provider');
      platform.ready().then(() => {
        this.nativeStorage.getItem("notice").then((value:string)=>{
            this.notice=decodeURI(value);
            console.log("!!!notice:"+this.notice);
        },err=>{

        })
      });

  }

  loginSocialLogin(type){
    if(type=="facebook"){
      return new Promise((resolve,reject)=>{
        this.fblogin(this.serverLogin,this,{}).then((res:any)=>{
                this.alertNotice(res.notice);
                resolve(res);
            }, (err)=>{
                reject(err);
            });
        });
    }else if(type=="kakao"){
      return new Promise((resolve,reject)=>{
        this.kakaologin(this.serverLogin,this,{}).then((res:any)=>{
                this.alertNotice(res.notice);            
                resolve(res);
            }, (err)=>{
                reject(err);
            });
          });
    }
  }

  alertNotice(notice){
      if(notice){
          if(!this.notice || this.notice!=notice){ //사용자에게 보여주고 notice를 저장한다.
                let alert = this.alertCtrl.create({
                    title: notice ,
                    buttons: ['OK']
                });
                alert.present();
                this.nativeStorage.setItem('notice',encodeURI(notice));
          }
      }
  }

  loginEmail(email:string,password:string){
    return new Promise((resolve, reject)=>{
            console.log("EmailServerLogin");

            let body = {email:email,password:password,version:this.storageProvider.version};
            let request;
            if(this.storageProvider.device){
                    request=this.storageProvider.serverAddress+"/emailLogin";
            }else{
                    request="http://localhost:8100/emailLogin";
            }
            console.log("loginEmail-request:"+request);
            this.httpClient.post(request,body).subscribe((res:any)=>{ 
                if(res.result=="success"){
                    this.alertNotice(res.notice);
                }              
                resolve(res);
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                reject(err);
            });           
       });
  }

  fblogin(handler,fbProvider:LoginProvider,params){    
    return new Promise((resolve,reject)=>{
      if(this.storageProvider.device) {
           fbProvider.fb.getLoginStatus().then((status_response) => { 
           console.log(JSON.stringify(status_response));
           if(status_response.status=='connected'){
              console.log("conneted status");
              //console.log(status_response.userId); //please save facebook id 
              fbProvider.fb.api("me/?fields=id,email,last_name,first_name", ["public_profile","email"]).then((api_response) =>{
                   console.log(JSON.stringify(api_response));
                   console.log("call server facebook login!!! referenceId:"+api_response.id);
                   console.log("serverAddress:"+fbProvider.storageProvider.serverAddress);

                   handler("facebook",api_response.id,fbProvider,params)
                         .then(
                             (result:any)=>{
                                          console.log("result comes:"+JSON.stringify(result)); 
                                          var param=result;
                                          param.id="facebook_"+api_response.id;
                                          if(api_response.hasOwnProperty("email")){
                                                 param.email=api_response.email;
                                          }
                                          if(api_response.hasOwnProperty("last_name") &&
                                                 api_response.hasOwnProperty("first_name")){
                                                 param.name=api_response.last_name+api_response.first_name;   
                                          }
                                          resolve(param);
                             },serverlogin_err=>{
                                          console.log("error comes:"+serverlogin_err);
                                          let reason={stage:"serverlogin_err",msg:serverlogin_err};
                                          reject(reason);
                             });
               },(api_err)=>{
                   console.log("facebook.api error:"+JSON.stringify(api_err));
                   let reason={stage:"api_err",msg:api_err}; 
                   reject(reason);
               }); 
           }else{ // try login
              console.log("Not connected status");
              fbProvider.fb.login(["public_profile","email"]).then((login_response:any) => {
                   console.log(JSON.stringify(login_response));
                   //console.log(login_response.userId);
                   fbProvider.fb.api("me/?fields=id,email,last_name,first_name", ["public_profile","email"]).then((api_response) =>{
                       console.log(JSON.stringify(api_response));
                       fbProvider.fb.getAccessToken().then(accessToken=>{ 
                              console.log("accessToken:"+accessToken);
                              console.log("call server facebook login!!!"+fbProvider);
                              handler("facebook",api_response.id,fbProvider,params)
                              .then(
                                 (result:any)=>{
                                             console.log("result comes:"+result); 
                                             var param=result;
                                             param.id="facebook_"+api_response.id;
                                             if(api_response.hasOwnProperty("email")){
                                                 param.email=api_response.email;
                                             }
                                             if(api_response.hasOwnProperty("last_name") &&
                                                 api_response.hasOwnProperty("first_name")){
                                                 param.name=api_response.last_name+api_response.first_name;   
                                             }
                                             resolve(param);
                                 },serverlogin_err=>{ 
                                             console.log(serverlogin_err);
                                             let reason={stage:"serverlogin_err",msg:serverlogin_err};
                                             reject(reason);
                                 });
                         },token_err=>{
                              console.log("access token error:"+JSON.stringify(token_err));
                              let reason={stage:"token_err",msg:token_err};
                              reject(reason);
                         });
                     },(api_err)=>{
                         console.log(JSON.stringify(api_err));
                         let reason={stage:"api_err",msg:api_err};
                         reject(reason);
                     }); 
               },(login_err)=>{
                   console.log(JSON.stringify(login_err));
                   let reason={stage:"login_err",msg:login_err};
                   reject(reason);
               }); 
           }
       },(status_err) =>{
           console.log(JSON.stringify(status_err)); 
           let reason={stage:"status_err",msg:status_err};
           reject(reason);
       });
      }else{
            console.log("Please run me on a device");
            let reason={stage:"cordova_err",msg:"run me on device"};
            reject(reason);
      }
      });
  }    

  kakaologin(handler,kakaoProvider,params){
    return new Promise((resolve,reject)=>{

      var scheme;
      if(this.platform.is('android')){
          scheme='com.kakao.talk';         
      }else if(this.platform.is('ios')){
          scheme='kakaotalk://';
      }else{
          console.log("unknown platform");
      }
      
      this.appAvailability.check(scheme).then(
          ()=> {  // Success callback
              console.log(scheme + ' is available. call KakaoTalk.login ');
              KakaoTalk.login(
                    (userProfile)=>{
                        console.log("userProfile:"+JSON.stringify(userProfile));
                        var id;
                        if(typeof userProfile === "string"){
                                id=userProfile;
                        }else{ // humm... userProfile data type changes. Why?
                                id=userProfile.id;
                        }
                        console.log('Successful kakaotalk login with'+id);
                        handler("kakao",id,kakaoProvider,params).then(
                        (result:any)=>{
                                    console.log("result comes-kakaoApp:"+JSON.stringify(result)); 
                                    result.id="kakao_"+id;
                                    resolve(result);
                        },serverlogin_err=>{
                                    console.log("error comes:"+serverlogin_err);
                                    let reason={stage:"serverlogin_err",msg:serverlogin_err};
                                    reject(reason);
                        });
                    },
                    (err)=> {
                        console.log('Error logging in');
                        console.log(JSON.stringify(err));
                        let reason={stage:"login_err",msg:err}; 
                        reject(reason);
                    }
              ); 
          },
          ()=>{  // Error callback
              console.log(scheme + ' is not available');
              reject({stage:"social_login", msg:"카카오톡이 설치되어있지 않습니다."});
          });     
      });
  }

  serverLogin(type,id,loginProvider:LoginProvider,params){
    return new Promise((resolve, reject)=>{
            console.log("serverLogin type:"+type);
            
            let body;

            //console.log("serverLogin body:"+JSON.stringify(body));

            console.log("server:"+ loginProvider.storageProvider.serverAddress);

            let request;

            if(type=="facebook"){
                request=loginProvider.storageProvider.serverAddress+"/facebooklogin";
                body = {referenceId:"facebook_"+id,
                            version:loginProvider.storageProvider.version};
            }else if(type=="kakao"){
                request=loginProvider.storageProvider.serverAddress+"/kakaoLogin";
                body = {referenceId:"kakao_"+id,version:loginProvider.storageProvider.version};
            }

            loginProvider.httpClient.post(request,body).subscribe((res)=>{              
               console.log("social login res:"+JSON.stringify(res));
               resolve(res); // 'success'(move into home page) or 'invalidId'(move into signup page)
              },(err)=>{
                  console.log( loginProvider.storageProvider.serverAddress+" server no response");
                  reject("social login no response");
              });            
       });
       
  }

  serverSignup(refid,name,email,country,phone,sex,birthYear,receiptIssue,receiptId,receiptType){    
    return new Promise((resolve, reject)=>{
              console.log("serverSignup !!!");
              let receiptIssueVal;
              if(receiptIssue){
                    receiptIssueVal=1;
              }else{
                    receiptIssueVal=0;
              }
              let body = {referenceId:refid,
                                            name:name,
                                            email:email,
                                            country:country,
                                            phone:phone,
                                            sex:sex, 
                                            birthYear:birthYear,
                                            receiptIssue:receiptIssueVal,
                                            receiptId:receiptId,
                                            receiptType:receiptType,
                                            version:this.storageProvider.version};
              let headers = new Headers();
              headers.append('Content-Type', 'application/json');
              console.log("server: "+ this.storageProvider.serverAddress+ " body:"+body);

             this.httpClient.post(this.storageProvider.serverAddress+"/signup",body).subscribe((res)=>{
                 resolve(res); // 'success'(move into home page) or 'invalidId'(move into signup page)
             },(err)=>{
                 console.log("signup no response "+JSON.stringify(err));
                 reject("signup no response");
             });
         });
  }


  emailServerSignup(password,name,email,country,phone,sex,birthYear,receiptIssue,receiptId,receiptType){
      return new Promise((resolve, reject)=>{
              console.log("emailServerSignup "+phone);
              let receiptIssueVal;
              if(receiptIssue){
                    receiptIssueVal=1;
              }else{
                    receiptIssueVal=0;
              }
              let body = {referenceId:"email_"+email,password:password,name:name,
                                            email:email,country:country,phone:phone,
                                            receiptIssue:receiptIssueVal,receiptId:receiptId,receiptType:receiptType,
                                            sex:sex, birthYear:birthYear,
                                            version:this.storageProvider.version};
              console.log("server:"+ this.storageProvider.serverAddress+" body:"+body);
             this.httpClient.post(this.storageProvider.serverAddress+"/signup",body).subscribe((res)=>{
                 //var result:string=res.result;
                    resolve(res); // 'success'(move into home page) or 'invalidId'(move into signup page)
             },(err)=>{
                 console.log("signup no response");
                 reject("signup no response");
             });
         });
  }


  logout(type){
    return new Promise((resolve,reject)=>{
                  console.log("server: "+ this.storageProvider.serverAddress);

                  this.httpClient.post(this.storageProvider.serverAddress+"/logout",{version:this.storageProvider.version}).subscribe((res)=>{
                    if(type=='facebook'){
                      this.fb.logout().then((result)=>{
                            resolve(res); 
                      },(err)=>{
                            resolve(res);
                      });
                    }else if(type=='kakao'){
                      var scheme;
                      if(this.platform.is('android')){
                          scheme='com.kakao.talk';         
                      }else if(this.platform.is('ios')){
                          scheme='kakaotalk://';
                      }else{
                          console.log("unknown platform");
                          resolve();
                      }
                      this.appAvailability.check(scheme).then(()=> {  // Success callback
                        console.log("call KakaoTalk.logout");
                        KakaoTalk.logout(()=>{
                            resolve();
                        },(err)=>{ // KakaoTalk.logout failure
                            resolve();
                        });
                      });
                    }else{
                        resolve();
                    }
                  },(err)=>{
                      //console.log("logout no response "+JSON.stringify(err));
                      reject(err);
                  });
    });
  }

  unregister(type){
    return new Promise((resolve,reject)=>{
            console.log("server: "+ this.storageProvider.serverAddress);

           this.httpClient.post(this.storageProvider.serverAddress+"/unregister",{version:this.storageProvider.version}).subscribe((res)=>{
               console.log("unregister "+JSON.stringify(res));
               if(type=='facebook'){
                    this.fb.logout().then((result)=>{
                          resolve(res); 
                    },(err)=>{
                          resolve(res);
                    });
                }else if(type=='kakao'){
                    var scheme;
                    if(this.platform.is('android')){
                        scheme='com.kakao.talk';         
                    }else if(this.platform.is('ios')){
                        scheme='kakaotalk://';
                    }else{
                        console.log("unknown platform");
                        resolve();
                    }
                    this.appAvailability.check(scheme).then(()=> {  // Success callback
                      console.log("call KakaoTalk.logout");
                      KakaoTalk.logout(()=>{
                          resolve();
                      },(err)=>{ // KakaoTalk.logout failure
                          resolve();
                      });
                    });
                }else{
                    resolve();
                }           
              },(err)=>{
               console.log("unregister no response "+JSON.stringify(err));
               reject("unregister no response");
           });
    });
  }

}
