import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the ConfigurePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-configure-password',
  templateUrl: 'configure-password.html',
})
export class ConfigurePasswordPage {
    oldPassword;
    newPassword;
    newPasswordConfirm;

  constructor(public navCtrl: NavController,
              private alertCtrl:AlertController,
              private storageProvider:StorageProvider,
              private serverProvider:ServerProvider, 
              private nativeStorage: NativeStorage,             
              public navParams: NavParams) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfigurePasswordPage');
  }

  back(){
    this.navCtrl.pop();
  }

  passwordValidity(password){
    var number = /\d+/.test(password);
    var smEng = /[a-z]+/.test(password);
    var bigEng= /[A-Z]+/.test(password);
    var special = /[^\s\w]+/.test(password);

    if(number && smEng && bigEng){
      return true;
    }
    else if(number && smEng && special){
      return true;
    }
    else if(bigEng && special && special){
      return true;
    }
    else if(bigEng && special && special){
      return true;
    }
    else{
      //this.paswordGuide = "영문대문자,영문소문자,특수문자,숫자 중 3개 이상 선택, 8자리 이상으로 구성하세요";
      return false;
    }
  }

  modify(){

      if(this.storageProvider.tourMode){
            let alert = this.alertCtrl.create({
                title: '둘러보기모드입니다.',
                buttons: ['OK']
            });
            alert.present();
            return;
      }

    if(this.oldPassword==undefined){
                  let alert = this.alertCtrl.create({
                        title: '기존 비밀번호를 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                    return;
    }
    if(!this.passwordValidity(this.newPassword)){
                  let alert = this.alertCtrl.create({
                        title: '새비밀번호가 규칙에 맞지 않습니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                    return;      
    }

    if(this.newPassword!=this.newPasswordConfirm){
                  let alert = this.alertCtrl.create({
                        title: '비밀번호가 일치하지 않습니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                    return;      
    }
    
    let receiptIssueVal;

    if(this.storageProvider.receiptId!=undefined && this.storageProvider.receiptId.trim().length>0)
            receiptIssueVal=1;
    else{
            receiptIssueVal=0;
    }

    let body= {email:this.storageProvider.email,
                newPassword:this.newPassword,
                oldPassword:this.oldPassword, 
                phone:this.storageProvider.phone, 
                name:this.storageProvider.name,
                receiptIssue:receiptIssueVal,
                receiptId:this.storageProvider.receiptId,
                receiptType:this.storageProvider.receiptType};

         this.serverProvider.post(this.storageProvider.serverAddress+"/modifyUserInfo",body).then((res:any)=>{
             console.log("res:"+JSON.stringify(res));
             if(res.result=="success"){
                var encrypted=this.storageProvider.encryptValue('password',this.newPassword);// save email id 
                this.nativeStorage.setItem('password',encodeURI(encrypted));
                
                let alert = this.alertCtrl.create({
                            title: "회원 정보가 수정되었습니다",
                            buttons: ['OK']
                        });
                        alert.present();
                        this.navCtrl.pop();
             }else if(res.error=="incorrect oldPassword"){
                let alert = this.alertCtrl.create({
                            title: "기존 비밀번호가 맞지 않습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
             }else{
                let alert = this.alertCtrl.create({
                            title: "회원 정보 수정에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
             }
         },(err)=>{
             if(err=="NetworkFailure"){
                let alert = this.alertCtrl.create({
                            title: "서버와 통신에 문제가 있습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
            }else{
                let alert = this.alertCtrl.create({
                            title: "회원 정보 수정에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
            }
         });

  }
}
