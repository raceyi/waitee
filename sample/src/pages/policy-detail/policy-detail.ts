import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PolicyDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-policy-detail',
  templateUrl: 'policy-detail.html',
})
export class PolicyDetailPage {
  kind:number;
  title:string;

  transactionAgreementShown=false;
  userAgreementShown=false;
  userInfoShown=false;
  locationShown=false;
  pictureShown=false;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.kind=navParams.get("kind");
    if(this.kind==1){
        this.title="이용약관";
        this.userAgreementShown=true;
    }else if(this.kind==2){
        this.title="개인 정보 처리방침";
        this.userInfoShown=true;
    }else if(this.kind==3){
        this.title="전자 금융거래 이용약관";
        this.transactionAgreementShown=true;
    }else if(this.kind==4){
        this.title="위치정보 사용"; 
        this.locationShown=true;
    }else if(this.kind==5){
        this.pictureShown=true;
        this.title="문자인식 사진정보 사용";
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PolicyDetailPage');
  }

  back(){
    this.navCtrl.pop();
  }

}
