import { Component ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams,App,AlertController,Events } from 'ionic-angular';
import {ReviewInputPage} from '../review-input/review-input';
import {OrderDetailPage} from '../order-detail/order-detail';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {TimeUtil} from '../../classes/TimeUtil';
import {CashPasswordPage} from '../cash-password/cash-password';
/**
 * Generated class for the OrderListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-list',
  templateUrl: 'order-list.html',
})
export class OrderListPage {
   orders=[];
   lastOrderId=-1;
   infiniteScroll;
   timeUtil= new TimeUtil(); 

  index=0; // 0: 1개월, 1:2개월, 2:3개월, 3:6개월 
  searchText;
  searchButtonHide=false;
  colStyle=[];
  buttonStyle=[];

  periodShown:boolean=false;
  startDate;
  endDate;
  periodSearch:boolean=false;
  keywordSearch:boolean=false;
  periodLocalStartTime;
  periodLocalEndTime;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storageProvider:StorageProvider,
              public serverProvider:ServerProvider,
              public alertController:AlertController,
              private events:Events, 
              private ngZone:NgZone, 
              private app:App) {
    this.colStyle=[
          {"border-right-style": "solid",
           "border-width": "1px",
           "border-radius":"13.5px"
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          }
    ];

    this.buttonStyle=[
          {'color':'#FF5F3A' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' }
    ];

    events.subscribe('orderUpdate', (param) =>{
      console.log("orderUpdate comes at order-list");
      this.refreshOrderList();
    });

    this.startDate=this.timeUtil.getTodayString();
    this.endDate=this.timeUtil.getTodayString();
}

  getOrderStatusString(order){
    console.log("status:"+order.orderStatus);
    if(order.orderStatus=="paid")
      return "결제완료";
    if(order.orderStatus=="cancelled")
      return "주문취소";
    if(order.orderStatus=="checked")
      return "주문접수";
    if(order.orderStatus=="completed")
      return "준비완료";      
    if(order.orderStatus=="pickup"){
      return "픽업완료("+ this.timeUtil.getlocalTimeStringWithoutDay(order.pickupTime)+')';
    }  
  }

  getDisplayTime(measureTime){
    return measureTime[2]+measureTime[3]+"/"+
          measureTime[5]+measureTime[6]+"/"+
          measureTime[8]+measureTime[9]+" "+
          measureTime[11]+measureTime[12]+":"+
          measureTime[14]+measureTime[15];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderListPage');
  }
  
  ionViewWillEnter() {
    console.log('ionViewWillEnter OrderListPage');
    this.startDate=this.timeUtil.getTodayString();
    this.endDate=this.timeUtil.getTodayString();
    this.periodSearch=false;
    this.keywordSearch=false;
    this.refreshOrderList();
  }

  refreshOrderList(){
    if(this.infiniteScroll!=undefined)
        this.infiniteScroll.enable(true); //stop infinite scroll
   this.ngZone.run(()=>{     
    this.orders=[]; // refresh orders when it enters this page.
   });
    this.lastOrderId=-1;
    this.getOrders().then((value)=>{
        console.log("getOrders done continue"+value);
        if(value){
          console.log("more is true");
          if(this.infiniteScroll!=undefined)
            this.infiniteScroll.complete();
      }else{
          console.log("more is false");
          if(this.infiniteScroll!=undefined)
            this.infiniteScroll.enable(false); //stop infinite scroll
      }

    });
  }

  resetStyle(){
    this.buttonStyle=[
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' },
          {'color':'#bdbdbd' }]

    this.colStyle=[
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          },
          {
            'boder-style':'none'
          }
    ];
  }

  select(index){
    console.log("select "+index+ " this.index:"+this.index);
    this.resetStyle();
    this.buttonStyle[index]={'color':'#FF5F3A' };
    if(index==0)
        this.colStyle[index]={"border-right-style": "solid",
                            "border-width": "1px",
                            "border-radius":"13.5px"
                          };
    else if(index==3)
        this.colStyle[index]={"border-left-style": "solid",
                            "border-width": "1px",
                            "border-radius":"13.5px"
                          };
    else{
        this.colStyle[index]={"border-left-style": "solid",
                              "border-right-style": "solid",
                              "border-width": "1px",
                              "border-radius":"13.5px"
                          };      
    }
    this.index=index;                      
    console.log("index:"+index);                       
  }

  searchKeyword(){
    console.log("searchKeyword comes");
    if(this.searchKeyword==undefined){
          let alert = this.alertController.create({
              title: '검색어를 입력해주세요.',
              buttons: ['OK']
          });
          alert.present();
         return;      
    }
    this.searchButtonHide=true;
    this.keywordSearch=true;
    this.refreshOrderList();
  }

  keywordClear(){
    console.log("keyWord clear comes");
    this.searchButtonHide=false;
    this.keywordSearch=false;
    this.searchText=""; 
    this.refreshOrderList();
  }

  inputReview(order){
     this.app.getRootNavs()[0].push(ReviewInputPage,{order:order});
  }

  orderDetail(order){  
      console.log("orderDetail comes");
      this.app.getRootNavs()[0].push(OrderDetailPage,{order:order});
  }

  cancelOrder(order){
    this.serverProvider.cancelOrder(order).then((resOrder)=>{
        this.app.getRootNav().push( OrderDetailPage,{order:resOrder});
    });
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    this.getOrders().then((more)=>{
      if(more){
          console.log("more is true");
          infiniteScroll.complete();
      }else{
          console.log("more is false");
          infiniteScroll.enable(false); //stop infinite scroll
      }
    },err=>{
          // hum...
    });
  }

  convertOrder(order){
     order.orderStatusString =this.getOrderStatusString(order);
     order.orderedTimeString=order.localOrderedTime[2]+order.localOrderedTime[3]+"/"+
                              order.localOrderedTime[5]+order.localOrderedTime[6]+"/"+
                              order.localOrderedTime[8]+order.localOrderedTime[9]+" "+
                              order.localOrderedTime[11]+order.localOrderedTime[12]+":"+
                              order.localOrderedTime[14]+order.localOrderedTime[15];
      let strs=order.takitId.split("@");
      order.name_sub = strs[0];
      order.name_main= strs[1];
  }
  
  getOrders(){
        return new Promise((resolve,reject)=>{
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
            console.log("server:"+ this.storageProvider.serverAddress);
            let body;           
            if(this.periodSearch){
              body={ 
                       lastOrderId: this.lastOrderId,
                       limit:this.storageProvider.OrdersInPage,
                       startLocalTime:this.periodLocalStartTime.toISOString(),
                       endLocalTime:this.periodLocalEndTime.toISOString()
                   };
            }else if(this.keywordSearch){
              body={ 
                      lastOrderId: this.lastOrderId,
                       limit:this.storageProvider.OrdersInPage,
                       keyword:this.searchText
                   };
            }else{
              body={ 
                      lastOrderId: this.lastOrderId,
                       limit:this.storageProvider.OrdersInPage
                   };
            }

            console.log("getOrders:"+JSON.stringify(body));
            this.serverProvider.post(this.storageProvider.serverAddress+"/getOrdersDefault",body).then((res:any)=>{
              console.log("orders:"+JSON.stringify(res.orders));
            if(res.result=="success" && Array.isArray(res.orders)){
                  this.ngZone.run(()=>{
                  console.log("orders.length:"+res.orders.length);
                  console.log("orders[0]:"+JSON.stringify(res.orders[0]));
                      res.orders.forEach((order)=>{
                            this.convertOrder(order);              
                            this.orders.push(order);
                      })
                      console.log("orders:"+JSON.stringify(this.orders));
                      this.lastOrderId=res.orders[res.orders.length-1].orderId;
                      if(res.orders.length<this.storageProvider.OrdersInPage){
                            resolve(false); // no more orders
                      }else{
                            resolve(true); // more orders can be shown.
                      }
                  });
            }else if(res.orders=="0"){ //Please check if it works or not
                console.log("no more orders");
                resolve(false);
            }else{
                console.log("What happen? !!!sw bug!!!");
            }
         },(err)=>{
            let alert = this.alertController.create({
                title: '서버와 통신에 문제가 있습니다',
                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                buttons: ['OK']
            });
            alert.present();
            reject(err);
         });
       });
  }

  periodOn(){
    console.log("periodOn");
    this.periodShown=true;
  }

  periodOff(){
    console.log("periodOff");
    this.periodShown=false;  
    this.periodSearch=false;  
  }

  doPeriodSearch(){
    console.log("doPeriodSearch");
    var startDate=new Date(this.startDate);
    var endDate=new Date(this.endDate);
    var currDate=new Date(); 
    console.log("startDate:"+startDate.toISOString());
    console.log("endDate:"+endDate.toISOString());
   
    if(startDate.getTime()>endDate.getTime()){
          let alert = this.alertController.create({
              title: '시작일은 종료일보다 늦을수 없습니다',
              buttons: ['OK']
          });
          alert.present();
         return;
    }
    if(endDate.getTime()>currDate.getTime()){
          let alert = this.alertController.create({
              title: '종료일은 현재시점보다 늦을수 없습니다.',
              buttons: ['OK']
          });
          alert.present();
         return;
    }

    this.periodSearch=true;
    this.keywordSearch=false;  // keyword와 기간 검색중에 하나만 가능함.
   
   startDate.setUTCHours(0,0,0,0);
   endDate.setUTCHours(23,59,59,999);

   this.periodLocalStartTime=startDate;
   this.periodLocalEndTime=endDate;

    console.log("!!! periodStartTime:"+this.periodLocalStartTime.toISOString());
    console.log("!!! periodEndTime:"+this.periodLocalEndTime.toISOString());
    
    this.refreshOrderList();
  }

  exitTourMode(){
    console.log("exit Tour Mode");
    this.app.getRootNav().pop();
  }
  
  orderAgain(order){  // hum... payment에서 보내는 구조로 가야만 한다. 확인이 필요함.
      //please check the price & discount rate ! server에서 하는것이 맞다. server에서 확인함. 
     let orderList=[];
     orderList.push({  
            payment:'cash',
            orderList:JSON.parse(order.orderList),
            timeConstraints:[], // server에서 확인함.
            deliveryAddress:order.deliveryAddress,
            paymethod:JSON.parse(order.payInfo),
            takitId:order.takitId,
            shopName:order.shopName,
            orderName:order.orderName,
            payInfo:order.payInfo,
            amount:order.total,
         });
     if(typeof order.total==='string')    
         order.total=parseInt(order.total);    
     let body = {payment:'cash',
                    orderList:JSON.stringify(orderList),
                    amount:order.total,
                    takeout: order.takeout, // takeout:0(inStore) , 1(takeout), 2(delivery) 
                    orderedTime:new Date().toISOString(),
                    cashId: this.storageProvider.cashId,
                    receiptIssue:this.storageProvider.receiptIssue,
                    receiptId:this.storageProvider.receiptId,
                    receiptType:this.storageProvider.receiptType,
                    takitId:order.takitId,
                    total:order.total,
                    payInfo:order.payInfo,
                    deliveryAddress:order.deliveryAddress,
                    paymethod: JSON.parse(order.payInfo) // 음... payment페이지로 이동해야만 하는가?
                }
      console.log("reorder-body:"+JSON.stringify(body));
      this.app.getRootNavs()[0].push(CashPasswordPage,{body:body,trigger:"orderList",
                                         title:"결제비밀번호" ,description:"결제 비밀번호를 입력해주세요.",
                                         class:"CashPasswordPage"});

  }
}
