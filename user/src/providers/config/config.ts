import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigProvider {
    public serverAddress:string="https://takit.biz:443";
    //public serverAddress:string="http://takit.biz:8000";

    public awsS3OCR:string="https://s3.ap-northeast-2.amazonaws.com/seerid.html/";
 
    public awsS3:string="https://s3.ap-northeast-2.amazonaws.com/seerid.cafe.image/";

    public OrdersInPage:number=10; // The number of orders shown in a page 

    public userSenderID="836964428266"; //fcm senderID

    public version="0.05"; //server version
 
    public kakaoTakitUser="04457a1cc7e876475f8ab431f63a2060";////Rest API key
    public kakaoOauthUrl="https://takit.biz/oauth"; 

    public certUrl="https://takit.biz:8443/kcpcert/kcpcert_start.jsp";
    public authReturnUrl="https://takit.biz/oauthSuccess";
    public authFailReturnUrl="https://takit.biz/oauthFailure";

    public tourEmail="help-ios@takit.biz";
    public tourPassword="i2p4h5o&ne";

    public accountMaskExceptFront=3;
    public accountMaskExceptEnd=5;
    
    constructor(){
        console.log("ConfigProvider constructor"); 
    }

    getAccountMaskExceptFront(){
        return this.accountMaskExceptFront;
    }

    getAccountMaskExceptEnd(){
        return this.accountMaskExceptEnd;
    }
    
    getServerAddress(){
        return this.serverAddress;
    }

    getAwsS3OCR(){
        return this.awsS3OCR;
    }

    getAwsS3(){
        return this.awsS3;
    }

    getOrdersInPage(){
        return this.OrdersInPage;
    }

    getUserSenderID(){
        return this.userSenderID;
    }

    getVersion(){
        return this.version;
    }

    getKakaoTakitUser(){
        return this.kakaoTakitUser;
    }

    getKakaoOauthUrl(){
        return this.kakaoOauthUrl;
    }

    getTourEmail(){
        return this.tourEmail;
    }

    getTourPassword(){
        return this.tourPassword;
    }

    getCertUrl(){
        return this.certUrl;
    }

    getAuthReturnUrl(){
        return this.authReturnUrl;
    }

    getAutFailReturnUrl(){
        return this.authFailReturnUrl;
    }
}
