import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import { WebIntent } from '@ionic-native/web-intent';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import { Keyboard } from '@ionic-native/keyboard';
var gOrderCheckPage:any;

/**
 * Generated class for the OrderCheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-check',
  templateUrl: 'order-check.html',
})
export class OrderCheckPage {
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

      this.orderDate=this.getTodayString(); 
      gOrderCheckPage=this;

      //Just for testing
      this.storageProvider.cancelFailurePayment.push({"shopName":"타킷 주식회사","address":"서울 서초구 강남대로 479  (반포동) B1층 131호 피치트리랩","approvalTime":"20180826192450","cardName":"NH기업체크","approvalNO":"30000172","amount":"100"});
      
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
    //this.orderDate
    //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderCheckPage.goHome();
      },3*60*1000); //3분   
}

configureMode(){
  console.log("searchMode:"+this.searchMode);
  this.searchMode=!this.searchMode;
  //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderCheckPage.goHome();
      },3*60*1000); //3분   
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
      gOrderCheckPage.goHome();
    },3*60*1000); //3분 
  }
  
  searchOrder(){
    //timer 해제하기 
      clearTimeout(this.timerId);
      //timer 설정하기 
     this.timerId = setTimeout(function(){
        // 3분후면 home으로 이동함. 
        gOrderCheckPage.goHome();
      },3*60*1000); //3분   

      this.orderInfo=undefined;

      if(!this.orderNO){
              let alert = this.alertController.create({
                title: '주문번호를 입력해주세요.',
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
                        title: '주문 내역이 존재하지 않습니다.',
                        subTitle:'날짜와 주문번호를 확인해주세요',
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
        gOrderCheckPage.goHome();
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
                        title: '카드 결제 취소에 성공했습니다.',
                        subTitle:'취소 승인 번호: '+ output.approvalNO,
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
              title: '카드 결제  취소에 실패했습니다.',
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
        gOrderCheckPage.goHome();
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
                        title: '취소되지 않은 주문입니다.',
                        subTitle:'주문상태를 확인해주세요.',
                        buttons: ['OK']
                      });
                      alert.present();
                      return;
              }
              if( res.order.cardCancel!=null){
                      let alert = this.alertController.create({
                        title: '카드 결제가 이미 취소되었습니다.',
                        subTitle:'카드사에 확인해주세요.',
                        buttons: ['OK']
                      });
                      alert.present();
                      return;
              }
              return;
          }
        }else if(res.result=="success"){
            console.log("cancelAmount:"+this.cancelAmount+ " cancelApprovalNO:"+this.cancelApprovalNO);
            this.serverProvider.smartroCancelPayment(this.cancelAmount,
                                                this.cancelApprovalNO,
                                                orderDate).then((res:any)=>{
                      let output=this.serverProvider.smartroResultParser(JSON.parse(res));
                      let alert = this.alertController.create({
                        title: '카드 결제 취소에 성공했습니다.',
                        subTitle:'취소 승인 번호: '+ output.approvalNO,
                        buttons: ['OK']
                      });
                      alert.present();
            },err=>{
                  //!!!!server 에 결제 취소를 저장한다.!!!!
                  let alert = this.alertController.create({
                    title: '카드 결제  내역 취소에 실패했습니다.',
                    buttons: ['OK']
                  });
                  alert.present();
            })  
        }else{ //res.result=="failure"
                  let alert = this.alertController.create({
                    title: '서버로 부터 카드 결제 내역 확인에 실패했습니다.',
                    buttons: ['OK']
                  });
                  alert.present();
        }
   },err=>{
                  let alert = this.alertController.create({
                    title: '서버로 부터 카드 결제 내역 확인에 실패했습니다.',
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
        gOrderCheckPage.goHome();
      },3*60*1000); //3분   

    if(orderInfo.orderStatus=='cancelled' && orderInfo.paymentType=="card" && orderInfo.cardCancel==null){
          let orderDate=this.orderDate.slice(0,4)+ this.orderDate.slice(5,7)+this.orderDate.slice(8,10);
            console.log("orderDate:"+orderDate);
            this.serverProvider.smartroCancelPayment( orderInfo.cardPayment.amount, //orderInfo.amount,
                                                orderInfo.cardPayment.approvalNO,//orderInfo.cardApprovalNO,
                                                orderDate).then((res:any)=>{
                      //!!!!server 에 결제 취소를 저장한다.!!!!
                      let output=this.serverProvider.smartroResultParser(JSON.parse(res));

                      let alert = this.alertController.create({
                        title: '카드 결제 취소에 성공했습니다.',
                        subTitle:'취소 승인 번호: '+output.approvalNO,
                        buttons: ['OK']
                      });
                      alert.present();
      },err=>{
            let alert = this.alertController.create({
              title: '카드 결제  내역 취소에 실패했습니다.',
              buttons: ['OK']
            });
            alert.present();
      })
    }  
  }

  goHome(){
    this.keyboard.hide();
    this.navCtrl.pop();
  }

  back(){
    this.keyboard.hide();
    this.navCtrl.pop();
  }
}
