import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from '../config/config';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform } from 'ionic-angular';

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

  public configurePassword:string=this.configProvider.configurePassword;
  
  public van:string=this.configProvider.van;      //store it in native storage
  public catid:string=this.configProvider.catid;  //store it in native storage
  public cancelFailurePayment=[];

  id:string; 

  myshoplist;
  myshop;
  takitId;

  email;
  name;
  phone;

  shop:any;
  categories:any;

  lastTransNo:number; // 카드결제 마지막 tranno

    constructor(public http: HttpClient,
                private configProvider:ConfigProvider,
                private nativeStorage:NativeStorage,
                private platform:Platform) {

            console.log('Hello StorageProvider Provider');
            this.platform.ready().then(() => {
                this.nativeStorage.getItem("lastTransNo").then((value:string)=>{
                    this.lastTransNo=parseInt(value)%10000;
                },err=>{
                    this.lastTransNo=0;
                    this.nativeStorage.setItem('lastTransNo',"0");
                })
                this.nativeStorage.getItem("cancelFailurePayment").then((value:string)=>{
                    this.cancelFailurePayment=JSON.parse(decodeURI(value));
                },err=>{
                    this.cancelFailurePayment=[];
                })
            });
    }

    getTransNo(){
        return new Promise((resolve, reject)=>{
            let lastTransNo=this.lastTransNo+1;
            this.nativeStorage.setItem('lastTransNo',lastTransNo.toString()).then((value)=>{
                this.lastTransNo=lastTransNo;
                resolve(this.lastTransNo);
            },err=>{
                reject("fail to update lastTransNo");
            })
        });
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

    public saveCancelFailure(output){
        this.cancelFailurePayment.push(output);
        let value=JSON.stringify(this.cancelFailurePayment);
         this.nativeStorage.setItem('cancelFailurePayment',encodeURI(value));
    }

    public updateCancelFailure(){
        let value=JSON.stringify(this.cancelFailurePayment);
         this.nativeStorage.setItem('cancelFailurePayment',encodeURI(value));
    }
    
}
