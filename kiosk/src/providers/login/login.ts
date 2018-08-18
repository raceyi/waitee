import { HttpClient ,HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {StorageProvider} from '../storage/storage';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';

/*
  Generated class for the LoginProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LoginProvider {

  constructor(public http: HTTP,
              public httpClient:HttpClient,
              public storage:StorageProvider,
              private platform:Platform) {
    console.log('Hello LoginProvider Provider');
  }

  EmailServerLogin(email:string,password:string){
      console.log("email:"+email+"password:"+password);
      return new Promise((resolve, reject)=>{
                  let body={email:email,password:password,version:this.storage.version};
             let url;     
             if(this.platform.is("cordova")){
                url=this.storage.serverAddress+"/shop/loginWithEmail";
             }else{
                url="http://localhost:8100/shop/loginWithEmail";
             }      
             console.log("url:"+url);
             if(this.platform.is("cordova")){
                this.http.post(url,body, {"Content-Type":"application/json"}).then((res:any)=>{
                        resolve(JSON.parse(res.data));
                    resolve(res);
                },(err)=>{
                    reject(err);
                });
             }else{
                this.httpClient.post(url,body, 
                            {headers: new HttpHeaders({'Content-Type':'application/json'})}).subscribe((res:any)=>{   
                            resolve(res);            
                },(err)=>{
                    console.log("emailLogin error "+JSON.stringify(err));
                    reject("emailLogin no response");
                });
             }
      });
  }

  logout(){
      let body={version:this.storage.version}

      return new Promise((resolve, reject)=>{
                    let body={version:this.storage.version};
                    if(this.platform.is("cordova")){
                        this.http.post(this.storage.serverAddress+"/shop/logout",body,{"Content-Type":"application/json"} ).then((res:any)=>{               

                        },(err)=>{
                            console.log("/shop/logout error "+JSON.stringify(err));
                            reject("/shop/logout no response");
                        });
                    }else{
                        this.httpClient.post(this.storage.serverAddress+"/shop/logout",body, 
                                    {headers: new HttpHeaders({'Content-Type':'application/json'})}).subscribe((res:any)=>{   
                                    resolve(res);            
                        },(err)=>{
                            console.log("/shop/logout error "+JSON.stringify(err));
                            reject("/shop/logout no response");
                        });                        
                    }
      });


  }
}
