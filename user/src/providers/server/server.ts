import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {StorageProvider} from '../storage/storage';
import {AlertController} from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {LoginProvider} from '../../providers/login/login';

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

    constructor(public http: HttpClient
                ,private storageProvider:StorageProvider
                ,private nativeStorage: NativeStorage
                ,public alertCtrl:AlertController
                ,public loginProvider:LoginProvider) {
      console.log('Hello ServerProvider Provider');
    }

    postAnonymous(request,bodyIn){
       console.log("!!!!post:"+bodyIn);
       let bodyObj=bodyIn;
       bodyObj.version=this.storageProvider.version;
       let body=JSON.stringify(bodyObj);
       console.log("request:"+request);

       return new Promise((resolve,reject)=>{
            this.http.post(request,body).subscribe((res:any)=>{               
                console.log("post version:"+res.version+" version:"+this.storageProvider.version);
                resolve(res);                    
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                reject(err);
            });
       });
    }

  post(request,bodyIn){
       console.log("!!!!post:"+bodyIn);
       let bodyObj=bodyIn;
       bodyObj.version=this.storageProvider.version;
       console.log("request:"+request);

       return new Promise((resolve,reject)=>{
            this.http.post(request,bodyObj).subscribe((res:any)=>{               
                console.log("post version:"+res.version+" version:"+this.storageProvider.version);
                resolve(res);                    
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                    this.loginAgain().then(()=>{
                        //call http post again
                        this.http.post(request,bodyObj).subscribe((res:any)=>{
                            console.log("post version:"+res.version+" version:"+this.storageProvider.version);
                            if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                console.log("post invalid version");
                                let alert = this.alertCtrl.create({
                                            title: '앱버전을 업데이트해주시기 바랍니다.',
                                            subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                            buttons: ['OK']
                                        });
                                alert.present();
                            }
                            resolve(res.json());  
                         },(err)=>{
                             reject("NetworkFailure");
                         });
                    },(err)=>{
                        reject(err);
                    });
                }else{
                    reject("NetworkFailure");
                }
            });
       });
  }

loginAgain(){
      return new Promise((resolve,reject)=>{
        console.log("[loginAgain] id:"+this.storageProvider.id);
                if(this.storageProvider.id=="facebook" || this.storageProvider.id=="kakao"){
                    this.loginProvider.loginSocialLogin(this.storageProvider.id).then((res:any)=>{
                                if(res.result=="success"){
                                    if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                        console.log("post invalid version");
                                        let alert = this.alertCtrl.create({
                                                    title: '앱버전을 업데이트해주시기 바랍니다.',
                                                    subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                                    buttons: ['OK']
                                                });
                                        alert.present();
                                    }
                                    resolve();
                                }else
                                    reject("HttpFailure");
                            },login_err =>{
                                reject("NetworkFailure");
                    });
                }else{ // email login 
                    this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storageProvider.decryptValue("password",decodeURI(value));
                        this.loginProvider.loginEmail(this.storageProvider.id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    if(parseFloat(res.version)>parseFloat(this.storageProvider.version)){
                                        let alert = this.alertCtrl.create({
                                                    title: '앱버전을 업데이트해주시기 바랍니다.',
                                                    subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                                    buttons: ['OK']
                                                });
                                        alert.present();
                                    }
                                    resolve();
                                }else
                                    reject("HttpFailure");
                            },login_err =>{
                                    reject("NetworkFailure");
                        });
                    });
                }
        });
  }

  saveOrder(body){
      return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("saveOrder:"+JSON.stringify(body));
            this.post(encodeURI(this.storageProvider.serverAddress+"/saveOrder"),body).then((res:any)=>{
                  console.log("res:"+JSON.stringify(res));
                  console.log("saveOrder-res.result:"+res.result);
                  if(res.result=="success"){
                    //resolve(res.orders);
                    resolve(res);
                  }else{
                    reject(res.error);
                  }
            },(err)=>{
                reject(err);  
            });
            this.nativeStorage.setItem("orderDoneFlag","true");
      });
  }

}
