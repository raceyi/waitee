import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import { WebIntent } from '@ionic-native/web-intent';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { Keyboard } from '@ionic-native/keyboard';
var gEnOrderCheckPage:any;

/**
 * Generated class for the EnOrderCheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-en-order-check',
  templateUrl: 'en-order-check.html',
})
export class EnOrderCheckPage {

  orderDate;
  searchMode=true;
  cancelFailurePayment=[];
  orderNO;
  orderInfo;
  cancelAmount;
  cancelApprovalNO;
  timerId;

  constructor(public navCtrl: NavController,
              public alertController:AlertController,
              private storageProvider:StorageProvider,
              private serverProvider:ServerProvider,
              private webIntent: WebIntent, 
              private keyboard: Keyboard,
              public navParams: NavParams) {
      gEnOrderCheckPage=this;

      this.orderDate=this.getTodayString(); 

      //Just for testing
      //this.storageProvider.cancelFailurePayment.push({"shopName":"타킷 주식회사","address":"서울 서초구 강남대로 479  (반포동) B1층 131호 피치트리랩","approvalTime":"20180826192450","cardName":"NH기업체크","approvalNO":"30000172","amount":"100"});
      
      this.storageProvider.cancelFailurePayment.forEach((payment)=>{
          //check year, month,date
          if(this.orderDate.substr(0,4)==payment.approvalTime.substr(0,4) && 
             this.orderDate.substr(5,2)==payment.approvalTime.substr(5,2) &&
             this.orderDate.substr(8,2)==payment.approvalTime.substr(8,2)){
              this.cancelFailurePayment.push(payment);
          }
      })
}

changeOrderDate(){
}

configureMode(){
  console.log("searchMode:"+this.searchMode);
  this.searchMode=!this.searchMode;
}

  getTodayString(){
    var d = new Date();
    var mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    var dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    var dString=d.getFullYear()+'-'+(mm)+'-'+dd;
    return dString;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderCheckPage');
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gEnOrderCheckPage.goHome();
      },3*60*1000); //3분   

  }
  
  searchOrder(){
    //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gEnOrderCheckPage.goHome();
      },3*60*1000); //3분   
    
      this.orderInfo=undefined;

      if(!this.orderNO){
              let alert = this.alertController.create({
                title: 'Please input your order number',
                buttons: ['OK']
              });
              alert.present();
              return;
      }
      let startTime = new Date();
          
      startTime.setFullYear(parseInt(this.orderDate.substr(0,4)));
      startTime.setMonth(parseInt(this.orderDate.substr(5,2))-1);
      startTime.setDate(parseInt(this.orderDate.substr(8,2)));

      startTime.setHours(0,0,0,0); //0시 0분 
      let endTime = new Date();
      endTime.setHours(23,59,59,999); //24시 
      
      let body={start:startTime.toISOString(),
                end:endTime.toISOString(),
                orderNO:this.orderNO,
                takitId:this.storageProvider.takitId};
                
      this.serverProvider.post("/kiosk/searchOrder",body).then((res:any)=>{
            console.log("res.order:"+JSON.stringify(res));
            if(res.order){
                this.orderInfo=res.order;
                this.orderInfo.orderList=JSON.parse(this.orderInfo.orderList);
                if(this.orderInfo.paymentType=="card"){
                    this.orderInfo.cardPayment=this.serverProvider.smartroResultParser(JSON.parse(this.orderInfo.cardPayment));
                }
            }else{
                      let alert = this.alertController.create({
                        title: 'The order doesn\'t exist.',
                        subTitle:'Please check if date and order number are correct.',
                        buttons: ['OK']
                      });
                      alert.present();
            }
      },err=>{

      })          
  }

  cancelPayment(payment,i){
    //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gEnOrderCheckPage.goHome();
      },3*60*1000); //3분   
    
      console.log("cancel:"+i);
      this.serverProvider.smartroCancelPayment(payment.amount,
                                                payment.approvalNO,
                                                payment.approvalTime).then((res:any)=>{
                      this.cancelFailurePayment.splice(i,1);
                      let index=this.storageProvider.cancelFailurePayment.findIndex(function(element){
                          return (element.amount==payment.amount && element.approvalNO==payment.approvalNO && element.approvalTime==payment.approvalTime);
                      });
                      if(index>=0){
                          this.storageProvider.cancelFailurePayment.splice(index,1);
                          this.storageProvider.updateCancelFailure();
                      }
                      let output=this.serverProvider.smartroResultParser(JSON.parse(res));
                      let alert = this.alertController.create({
                        title: 'The card payment is cancelled.',
                        subTitle:  'Approval NO for cancellation:'+  output.approvalNO,
                         buttons: ['OK']                       
                        /*
                        subTitle:'취소 영수증을 출력하시겠습니까?',
                        buttons: [
                                {
                                  text: '아니오',
                                  handler: () => {
                                    console.log('Disagree clicked');
                                  }
                                },
                                {
                                  text: '네',
                                  handler: () => {
                                    console.log('Agree clicked');
                                    // !!!서버에 출력 명령어를 보내자!!!
                                  }
                                }
                              ]
                          */
                      });
                      alert.present();
      },err=>{
            let alert = this.alertController.create({
              title: 'Failed to cancel card payment.',
              buttons: ['OK']
            });
            alert.present();
      })
  }

  cancelApprovalNOPayment(){
    //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gEnOrderCheckPage.goHome();
      },3*60*1000); //3분   
    
   // server에서 order의 상태를 확인한다. cancel이거나 아예 주문 정보가 저장안되었을 경우만 취소가능하다.
   let orderDate=this.orderDate.slice(0,4)+ this.orderDate.slice(5,7)+this.orderDate.slice(8,10);
   let body={approvalNO: this.cancelApprovalNO,
             approvalDate:orderDate,
             catid:this.storageProvider.catid};
   console.log("cancelApprovalNOPayment comes");           
   this.serverProvider.post("/kiosk/searchOrderWithCardInfo",body).then((res:any)=>{
        console.log("res:"+JSON.stringify(res));
        if(res.result=="success" && res.order){
          console.log("orderInfo comes:"+JSON.stringify(res.order));
          if(!(res.order.orderStatus=='cancelled' && res.order.cardCancel==null)){
              if(res.order.orderStatus!='cancelled'){
                      let alert = this.alertController.create({
                        title: 'This order has not been canceled.',
                        subTitle:'Please check the order status.',
                        buttons: ['OK']
                      });
                      alert.present();
                      return;
              }
              if( res.order.cardCancel!=null){
                      let alert = this.alertController.create({
                        title: 'Your card payment has already been canceled.',
                        subTitle:'Please check with the card company',
                        buttons: ['OK']
                      });
                      alert.present();
                      return;
              }
              return;
          }
        }else if(res.result=="success"){
            this.serverProvider.smartroCancelPayment(this.cancelAmount,
                                                this.cancelApprovalNO,
                                                orderDate).then((res:any)=>{
                      let output=this.serverProvider.smartroResultParser(JSON.parse(res));
                      let alert = this.alertController.create({
                        title: 'The card payment is cancelled.',
                        subTitle:  'Approval NO for cancellation:'+  output.approvalNO,
                        buttons: ['OK']
                      });
                      alert.present();
            },err=>{
                  //!!!!server 에 결제 취소를 저장한다.!!!!
                  let alert = this.alertController.create({
                    title: 'Failed to cancel card payment.',
                    buttons: ['OK']
                  });
                  alert.present();
            })  
        }else{ //res.result=="failure"
                  let alert = this.alertController.create({
                    title: 'Failed to check card payment history from server.',
                    buttons: ['OK']
                  });
                  alert.present();
        }
   },err=>{
                  let alert = this.alertController.create({
                    title: 'Failed to check card payment history from server.',
                    buttons: ['OK']
                  });
                  alert.present();
   })
  }

  cancelCardPayment(orderInfo){
    //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gEnOrderCheckPage.goHome();
      },3*60*1000); //3분   
    
    if(orderInfo.orderStatus=='cancelled' && orderInfo.paymentType=="card" && orderInfo.cardCancel==null){
          let orderDate=this.orderDate.slice(0,4)+ this.orderDate.slice(5,7)+this.orderDate.slice(8,10);
            console.log("orderDate:"+orderDate);
            this.serverProvider.smartroCancelPayment(orderInfo.amount,
                                                orderInfo.cardApprovalNO,
                                                orderDate).then((res:any)=>{
                      //!!!!server 에 결제 취소를 저장한다.!!!!
                      let output=this.serverProvider.smartroResultParser(JSON.parse(res));
                      let alert = this.alertController.create({
                        title: 'The card payment is cancelled.',
                        subTitle:  'Approval NO for cancellation:'+  output.approvalNO,
                        buttons: ['OK']
                      });
                      alert.present();
      },err=>{
            let alert = this.alertController.create({
              title: 'Failed to cancel card payment',
              buttons: ['OK']
            });
            alert.present();
      })
    }  
  }
  back(){
    this.navCtrl.pop();
  }

   goHome(){
    this.keyboard.hide();
    this.navCtrl.pop();
  }

}
