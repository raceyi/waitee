import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {StorageProvider} from '../storage/storage';
import {LoginProvider} from '../login/login';
import { NativeStorage } from '@ionic-native/native-storage';
import { HTTP } from '@ionic-native/http';
import { NavController,Platform,AlertController} from 'ionic-angular';

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  constructor(public http: HTTP,
              public httpClient:HttpClient,
              public storage:StorageProvider,
              private nativeStorage: NativeStorage,
              private platform:Platform,
              public login:LoginProvider) {
    console.log('Hello ServerProvider Provider');
  }

  post(reqUrl,body){
    return new Promise((resolve, reject)=>{
            body.version=this.storage.version;
            console.log("body:"+JSON.stringify(body));

           if(this.platform.is("cordova")){
                let url=this.storage.serverAddress+reqUrl;
                this.http.post(url,body, {"Content-Type":"application/json"}).then((res:any)=>{
                        console.log("res:"+JSON.stringify(res));
                        resolve(JSON.parse(res.data));
                },(err)=>{
                        console.log("post error "+JSON.stringify(err));
                        if(err.hasOwnProperty("status") && err.status==401){  // 맞는지 확인이 필요하다... native plugin 일경우 확인하자!!!
                            this.loginAgain().then(()=>{
                                //call http post again
                                this.http.post(url,body,{"Content-Type":"application/json"}).then((res)=>{
                                    resolve(JSON.parse(res.data));  
                                },(err)=>{
                                    reject("NetworkFailure");
                                });
                            });
                        }else
                            reject("post no response");
                    });
           }else{ // ionic serve
                let url="http://localhost:8100"+reqUrl;
                this.httpClient.post(url,body).subscribe((res:any)=>{
                        //console.log("res:"+JSON.stringify(res));
                        resolve(res);
                },(err)=>{
                        console.log("post error "+JSON.stringify(err));
                        if(err.hasOwnProperty("status") && err.status==401){  // 맞는지 확인이 필요하다... native plugin 일경우 확인하자!!!
                            this.loginAgain().then(()=>{
                                //call http post again
                                this.httpClient.post(url,body).subscribe((res)=>{
                                    resolve(res);  
                                },(err)=>{
                                    reject("NetworkFailure");
                                });
                            });
                        }else
                            reject("post no response");
                    });
           }
      });    
  }


  loginAgain(){
      return new Promise((resolve,reject)=>{
        console.log("[loginAgain] id:"+this.storage.id);
                    this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storage.decryptValue("password",decodeURI(value));
                        this.login.EmailServerLogin(this.storage.id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    if(res.version!=this.storage.version){
                                        console.log("post invalid version");
                                    }
                                    resolve();
                                }else
                                    reject("HttpFailure");
                            },login_err =>{
                                    reject("NetworkFailure");
                        });
                    });
        });
  }

}
