import { Injectable } from '@angular/core';
import { Facebook } from '@ionic-native/facebook';
import {Platform} from 'ionic-angular';
import {StorageProvider} from '../storage/storage';
import {Http,Headers} from '@angular/http';
import { AppAvailability } from '@ionic-native/app-availability';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';

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
  
  constructor(public fb: Facebook,private platform:Platform
      ,public storageProvider:StorageProvider, private appAvailability: AppAvailability
      ,private iab: InAppBrowser,private httpClient: HttpClient) {
    console.log('Hello LoginProvider Provider');
  }

  loginSocialLogin(type){
    if(type=="facebook"){
      return new Promise((resolve,reject)=>{
        this.fblogin(this.serverLogin,this,{}).then((res:any)=>{
                resolve(res);
            }, (err)=>{
                reject(err);
            });
        });
    }else if(type=="kakao"){
      return new Promise((resolve,reject)=>{
        this.kakaologin(this.serverLogin,this,{}).then((res:any)=>{
                resolve(res);
            }, (err)=>{
                reject(err);
            });
          });
    }
  }

  loginEmail(email:string,password:string){
    return new Promise((resolve, reject)=>{
            console.log("EmailServerLogin");

            let body = {email:email,password:password,version:this.storageProvider.version};

            this.httpClient.post(this.storageProvider.serverAddress+"/emailLogin",body).subscribe((res:any)=>{               
                resolve(JSON.parse(res));
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
            });           
       });
  }

  signup(type,params){
    if(type=="facebook"){
      return new Promise((resolve,reject)=>{
        this.fblogin(this.serverSignup,this,params).then((res:any)=>{
                resolve(res);
            }, (err)=>{
                reject(err);
            });
        });
    }else if(type=="kakao"){
      return new Promise((resolve,reject)=>{
        this.kakaologin(this.serverSignup,this,params).then((res:any)=>{
                resolve(res);
            }, (err)=>{
                reject(err);
            });
          });
    }else{ // email
      return new Promise((resolve,reject)=>{
        this.serverSignup(type,params.email,this,params).then((res:any)=>{
          resolve(res);
        }, (err)=>{
            reject(err);
        });
      });
    }
  }

  fblogin(handler,fbProvider:LoginProvider,params){    
    return new Promise((resolve,reject)=>{
      if(this.platform.is('cordova')) {
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

            console.log("serverLogin body:"+JSON.stringify(body));

            let headers = new HttpHeaders();
            headers.append('Content-Type', 'application/json');

            console.log("facebookServerLogin headers:"+headers)
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

            loginProvider.httpClient.post(request,body,{headers: headers}).subscribe((res)=>{              
               console.log("social login res:"+JSON.stringify(res));
               resolve(res); // 'success'(move into home page) or 'invalidId'(move into signup page)
              },(err)=>{
                  console.log( loginProvider.storageProvider.serverAddress+" server no response");
                  reject("social login no response");
              });            
       });
       
  }

  serverSignup(type,id,loginProvider:LoginProvider,params){    
    return new Promise((resolve, reject)=>{
            console.log("serverSignup !!!"+loginProvider.storageProvider.serverAddress);
            let body;
            if(type=="facebook" ||type=="kakao"){
              body = {   type:type,
                                          id:type+"_"+id,
                                          name:params.name,
                                          email:params.email,
                                          phone:params.phone,
                                          sex:params.sex, 
                                          birthYear:params.birthYear,
                                          version:loginProvider.storageProvider.version};
            }else{ //email
              body = {   type:type,
                                        password:params.password,
                                        name:params.name,
                                        email:params.email,
                                        phone:params.phone,
                                        sex:params.sex, 
                                        birthYear:params.birthYear,
                                        version:loginProvider.storageProvider.version};
            }
            let headers = new HttpHeaders();
            headers.append('Content-Type', 'application/json');
            console.log("server: "+ loginProvider.storageProvider.serverAddress+ " body:"+JSON.stringify(body));

            loginProvider.httpClient.post(loginProvider.storageProvider.serverAddress+"/signup",body,{headers: headers}).subscribe((res)=>{
               resolve(res); // 'success'(move into home page) or 'invalidId'(move into signup page)
           },(err)=>{
               console.log("signup no response "+JSON.stringify(err));
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

           this.httpClient.post(this.storageProvider.serverAddress+"/signoff",{version:this.storageProvider.version}).subscribe((res)=>{
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
