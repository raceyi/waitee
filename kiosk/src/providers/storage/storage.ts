import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from '../config/config';

import * as CryptoJS from 'crypto-js';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {

  public version=this.configProvider.version; 
  public serverAddress:string=this.configProvider.serverAddress;
  public awsS3:string=this.configProvider.awsS3;
             
  id:string; 

  myshoplist;
  myshop;

  email;
  name;
  phone;

  shop:any;
  categories:any;

  constructor(public http: HttpClient,private configProvider:ConfigProvider) {
    console.log('Hello StorageProvider Provider');
  }

      decryptValue(identifier,value){
        var key=value.substring(0, 16);
        var encrypt=value.substring(16, value.length);
        console.log("value:"+value+" key:"+key+" encrypt:"+encrypt);
        var decrypted=CryptoJS.AES.decrypt(encrypt,key);
        if(identifier=="id"){ // not good idea to save id here. Please make a function like getId
            this.id=decrypted.toString(CryptoJS.enc.Utf8);
            console.log("save id into storageProvider "+this.id);
        }
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    encryptValue(identifier,value){
        var buffer="";
        for (var i = 0; i < 16; i++) {
            buffer+= Math.floor((Math.random() * 10));
        }
        console.log("buffer"+buffer);
        var encrypted = CryptoJS.AES.encrypt(value, buffer);
        console.log("value:"+buffer+encrypted);
        
        if(identifier=="id") // not good idea to save id here. Please make a function like saveId
            this.id=value;
        return (buffer+encrypted);    
    }

    public userInfoSetFromServer(userInfo:any){
        console.log("userInfoSetFromServer:"+JSON.stringify(userInfo));
        this.email=userInfo.email;
        this.name=userInfo.name;
        this.phone=userInfo.phone;
    }


}
