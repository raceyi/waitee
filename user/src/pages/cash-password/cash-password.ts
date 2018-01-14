import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,Events } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {OrderDetailPage} from '../order-detail/order-detail';
/**
 * Generated class for the CashPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-password',
  templateUrl: 'cash-password.html',
})
export class CashPasswordPage {
  passwordInput=['',' ',' ',' ',' ',' '];
  password=['1',' ',' ',' ',' ',' '];
  cursor:number=0;

  title:string;
  description:string;
  confirmInProgress=false;

  callback;

  body;
  trigger;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private alertController:AlertController,
              public serverProvider:ServerProvider,
              private events:Events,
              private storageProvider:StorageProvider) {
    this.body=navParams.get("body");
    this.trigger=navParams.get("trigger");

    this.callback = this.navParams.get("callback");                
    this.title=navParams.get("title");
    this.description=navParams.get("description");
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashPasswordPage');
  }

  back(){
      this.navCtrl.pop();
  }

 buttonPressed(val:number){
        console.log("cursor:"+this.cursor+" val:"+val);
        if(val==-1 ){
            console.log("val is -1");
            this.cursor = (this.cursor>=1) ? (this.cursor-1 ): this.cursor;
            this.password[this.cursor]=' ';
            this.passwordInput[this.cursor]=' ';
        }else if(val==-10){
            console.log("val is -10");
            for(var i=0;i<6;i++){
                this.password[i]=' ';
                this.passwordInput[i]=' ';
            }
            this.cursor = 0;
        }else if(this.cursor<6){
            if(this.cursor!=0){
              this.password[this.cursor-1]='*';
            }
            if(this.cursor==5){
                this.passwordInput[this.cursor]=val.toString();  
                this.password[this.cursor++]='*';
            }else{
                this.passwordInput[this.cursor]=val.toString();  
                this.password[this.cursor++]=val.toString();
            }
            console.log("this.password:"+this.password);
        }
        if(this.cursor==6){
              this.confirm();
        }
  }
  
  confirm(){
    console.log("confirm");
    if(this.callback){
        for(let i=0;i<6;i++){
            if(this.passwordInput[i]==' '){
                let alert = this.alertController.create({
                        title: '비밀번호 6자리를 입력해주시기바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
                    this.confirmInProgress=false;
                    return;        
            }
        }
        var cashPassword="";
        cashPassword=cashPassword.concat(this.passwordInput[0],this.passwordInput[1],this.passwordInput[2],
                    this.passwordInput[3],this.passwordInput[4],this.passwordInput[5]);
        this.callback(cashPassword).then(()=>{
            this.navCtrl.pop();
        });
        return;
    }else{
        if(!this.confirmInProgress){
            this.confirmInProgress=true;

            for(let i=0;i<6;i++){
                if(this.passwordInput[i]==' '){
                    let alert = this.alertController.create({
                            title: '비밀번호를 입력해주시기바랍니다.',
                            buttons: ['OK']
                        });
                        alert.present();
                        this.confirmInProgress=false;
                        return;        
                }
            }
            let cashPassword="";
            cashPassword=cashPassword.concat(this.passwordInput[0],this.passwordInput[1],this.passwordInput[2],
                                this.passwordInput[3],this.passwordInput[4],this.passwordInput[5]);

            console.log("passwordInput:");
            for(let i=0;i<6;i++){
                console.log(this.passwordInput[i]);
            }

            this.body.password=cashPassword;
            console.log("body:"+JSON.stringify(this.body));
            this.serverProvider.saveOrder(this.body).then((res:any)=>{    
                        console.log(JSON.stringify(res)); 
                        let result:string=res.result;
                        if(result=="success"){
                            if(this.trigger=="cart"){
                                    let cart={menus:[],total:0};
                                    this.storageProvider.resetCartInfo().then(()=>{
                                        
                                    },()=>{
                                            //move into shophome
                                            let alert = this.alertController.create({
                                                    title: '장바구니 정보 업데이트에 실패했습니다',
                                                    buttons: ['OK']
                                                });
                                                alert.present();
                                    });
                            }
                            this.events.publish("orderUpdate",{order:res.order});
                            this.events.publish("cashUpdate");
                            this.navCtrl.push(OrderDetailPage,{order:res.order,trigger:"order"});
                            this.confirmInProgress=false;
                        }else{
                            let alert = this.alertController.create({
                                title: '주문에 실패하였습니다.',
                                subTitle: '다시 주문해주시기 바랍니다.',
                                buttons: ['OK']

                            });
                            alert.present();
                            this.navCtrl.pop();
                            //this.app.getRootNav().pop();
                            this.confirmInProgress=false;
                        }
                },(error)=>{
                        console.log("saveOrder err "+error);
                        if(error=="NetworkFailure"){
                            let alert = this.alertController.create({
                                    title: '서버와 통신에 문제가 있습니다',
                                    subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="shop's off"){
                            let alert = this.alertController.create({
                                    title: '지금은 주문을 할 수 없습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="break time"){
                            let alert = this.alertController.create({
                                    title: '지금은 브레이크타임 입니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="last order end"){
                            let alert = this.alertController.create({
                                    title: '주문 가능 시간이 아닙니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else if(error=="invalid cash password"){
                            let alert = this.alertController.create({
                                    title: '비밀번호가 일치하지 않습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();
                        }else{
                            let alert = this.alertController.create({
                                    title: '주문에 실패했습니다.',
                                    buttons: ['OK']
                                });
                                alert.present();                     
                        }
                        this.navCtrl.pop();
                        this.confirmInProgress=false;
                })      
            }
    }    
  }
}
