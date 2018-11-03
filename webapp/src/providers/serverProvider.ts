import {Injectable} from '@angular/core';
import { AlertController, Platform} from 'ionic-angular';
import {Http,Headers} from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import {EmailProvider} from './LoginProvider/email-provider';

import {StorageProvider} from './storageProvider';

import 'rxjs/add/operator/map';

@Injectable()
export class ServerProvider{
    fileTransfer: FileTransferObject = this.transfer.create();
    private loading:any;

  constructor(private platform:Platform,public http:Http,
            private nativeStorage: NativeStorage,private transfer: FileTransfer,
            private alertController:AlertController,
            private emailProvider:EmailProvider,
            private storageProvider:StorageProvider) {

      console.log("ServerProvider constructor");
  }

  post(request,bodyIn){
      console.log("!!!!post:"+bodyIn);
       let bodyObj=JSON.parse(bodyIn);
       bodyObj.version=this.storageProvider.version;
       let body=JSON.stringify(bodyObj);
       console.log("request:"+request);

       return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("bodyIn:"+bodyIn);
            let url;
            if(this.storageProvider.device){
                url=this.storageProvider.serverAddress+request;
            }else
                url= "http://localhost:8100"+request;
            console.log("url:"+url);
            //this.http.post(url,body,{headers: headers, withCredentials: true}).timeout(this.storageProvider.timeout).subscribe((res)=>{
            this.http.post(url,body,{headers: headers}).timeout(this.storageProvider.timeout).subscribe((res)=>{
                resolve(res.json());                   
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                    this.loginAgain().then(()=>{
                        //call http post again
                         this.http.post(this.storageProvider.serverAddress+request,body,{headers: headers}).timeout(this.storageProvider.timeout).subscribe((res)=>{
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
                    this.nativeStorage.getItem("password").then((value:string)=>{
                        var password=this.storageProvider.decryptValue("password",decodeURI(value));
                        this.emailProvider.EmailServerLogin(this.storageProvider.id,password).then((res:any)=>{
                                console.log("MyApp:"+JSON.stringify(res));
                                if(res.result=="success"){
                                    if(res.version!=this.storageProvider.version){
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

  updateCashAvailable(){
      return new Promise((resolve,reject)=>{
           let body = JSON.stringify({takitId:this.storageProvider.myshop.takitId});
           console.log("/shop/getBalance "+body);
           this.post("/shop/getBalance",body).then((res:any)=>{
                console.log("res:"+JSON.stringify(res));
                if(res.result=="success"){
                    this.storageProvider.cashAvailable=res.balance;
                    this.storageProvider.totalSales=res.sales;
                    resolve(res);
                }else{
                    reject("캐쉬정보를 가져오는데 실패했습니다.");
                }
           },(err)=>{
                    reject(err);
           });
      });
  }



  addCategory(category){
      category.takitId = this.storageProvider.shopInfo.takitId;
      return new Promise((resolve,reject)=>{
           let body = JSON.stringify(category);
           console.log("/shop/addCategory "+body);
           this.post("/shop/addCategory",body).then((res:any)=>{
                console.log("res:"+JSON.stringify(res));
                if(res.result=="success"){
                    resolve();
                }else{
                    reject("카테고리 추가에 실패했습니다.");
                }
           },(err)=>{
                    reject(err);
           });
      });
  }

  modifyCategory(category){
    category.takitId = this.storageProvider.shopInfo.takitId;
        return new Promise((resolve,reject)=>{
            let body = JSON.stringify(category);
            console.log("/shop/modifyCategory "+body);
            this.post("/shop/modifyCategory",body).then((res:any)=>{
                console.log("res:"+JSON.stringify(res));
                if(res.result=="success"){
                    resolve();
                }else{
                    reject("카테고리 수정에 실패했습니다.");
                }
            },(err)=>{
                    reject(err);
            });
        });
  }

    get(request){
      // console.log("!!!!get:"+request);
       return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.get(request,{headers: headers}).timeout(this.storageProvider.timeout).subscribe((res)=>{
            resolve(res.json());
        },(err)=>{
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                    this.loginAgain().then(()=>{
                        //call http post again
                         this.http.get(request,{headers: headers}).timeout(this.storageProvider.timeout).subscribe((res)=>{
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

    getShopInfoAll(takitId){
        return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("takitId:"+takitId);
            //console.log("!!!server:"+ this.storageProvider.serverAddress+"/cafe/shopHome?takitId="+takitId);
            this.post("/cafe/shopHome",JSON.stringify({takitId:takitId})).then((res)=>{
                //console.log("res:"+JSON.stringify(res));
                resolve(res);
            },(err)=>{
                reject("http error");  
            });
        });   
    }


    addMenuInfo(menu){
        return new Promise((resolve,reject)=>{
            if(menu.imagePath.includes("?")){
               let substrs=menu.imagePath.split("?");
               menu.imagePath=substrs[0]+substrs[1];
               console.log("correct imagePath:"+menu.imagePath); 
            }
            let body = JSON.stringify(menu);
            this.post("/shop/addMenu",body).then((res:any)=>{
                console.log(res);
                resolve(res);
            },(err)=>{
                reject("serverProvider addMenuInfo error");
            });
        });
    }


  onProgress(progressEvent: ProgressEvent){
      let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      console.log("progress:"+progress);
      if(progress==100){
      }
  }

  fileTransferFunc(uploadFile /* imageURI */,menu){
      //사용자가 이미지 이름 변경했을 수도 있으므로 입력된 imagePath값으로 함
    return new Promise((resolve,reject)=>{
        if(uploadFile !== undefined){
            //let filename= imageURI.substr(imageURI.lastIndexOf('/') + 1); 
            //console.log("imageURI:"+imageURI);
            console.log("filename:"+menu.imagePath);
            let options :FileUploadOptions = {
                fileKey: 'file',
                fileName: menu.imagePath,
                mimeType: 'image/jpeg',
                params: {
                    fileName: this.storageProvider.myshop.takitId+"_"+menu.imagePath,
                    takitId:this.storageProvider.myshop.takitId,
                    menuNO :menu.menuNO,
                    menuName:menu.menuName
                }
            }; 
            this.fileTransfer.onProgress(this.onProgress);

                ///////////////////////////////
            this.loading=this.alertController.create({
                    title:"사진을 업로드하고 있습니다"
                    });
            this.loading.present();
                ///////////////////////////////
            console.log("fileTransfer.upload");

            this.post( this.storageProvider.serverAddress+"/shop/uploadMenuImage", options)
            .then((response: any) => {
                console.log("upload:"+JSON.stringify(response));
                let result=JSON.parse(response.response);
                console.log("result.result:"+result.result);
                resolve(result);
                this.loading.dismiss();
            },err=>{
                reject(err);
            });
        }else{
            let alert = this.alertController.create({
                title : "사진을 선택해주세요.",
                buttons : ['확인']
            });
            alert.present();
        }
    });

  }

    modifyMenuInfo(menu){
        return new Promise((resolve,reject)=>{
            console.log("modifyMenuInfo-menu:"+JSON.stringify(menu));
            console.log("menu.imagePath:"+menu.imagePath);
            if(menu.imagePath && menu.imagePath.includes("?")){
               let substrs=menu.imagePath.split("?");
               menu.imagePath=substrs[0]+substrs[1];
               console.log("correct imagePath:"+menu.imagePath); 
            }
            this.post("/shop/modifyMenu",JSON.stringify(menu)).then((res:any)=>{
                console.log(res);
                resolve(res);
            },(err)=>{
                reject(err);
            });
        });
    }

    removeMenu(menu){
        return new Promise((resolve,reject)=>{
            this.post('/shop/removeMenu',JSON.stringify(menu)).then((res:any)=>{
                console.log(res);
                resolve(res);
            },(err)=>{
                reject(err);
            });
        });
    }

    removeCategory(category){
        console.log(category);
        let body ={"categoryNO":category.categoryNO,
                    "sequence":category.sequence,
                    "takitId":this.storageProvider.myshop.takitId}
        return new Promise((resolve,reject)=>{
            this.post('/shop/removeCategory',JSON.stringify(body))
            .then((res:any)=>{
                console.log(res);
                resolve(res);
            },(err)=>{
                reject(err);
            });
        });
    }    
}
