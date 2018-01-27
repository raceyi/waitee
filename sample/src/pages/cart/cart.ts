import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {PaymentPage} from '../payment/payment';

/**
 * Generated class for the CartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {
  order:any;
  carts=[];
  totalAmount:number;

  ////////////////////////////////////////////////////////////////////////////////
  // carts의 구조
  // cart - orderList(backward compatibility?) - menus
  // cart에는 하나의 orderList가 존재. 
  // 하나의 orderList에는 여러개의 menus가 존재
  // 하나의 menu는 장바구니 담기로 바구니에 담긴 item이 하나로 들어감
  // menu의 quantity만 cart에서 조정됨.(처음 장바구니 담기에 들어간 price로 가격을 계산함)
  // db 저장 shop 정보: takitId, address, deliveryArea, freeDelivery, deliveryFee,paymethod, shopName, 
  //                  options,unitPrice, quantity,takeout,memo, menuNo, menuName
  ////////////////////////////////////////////////////////////////////////////////////

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              public storageProvider:StorageProvider) {
  console.log("cart:"+navParams.get('cart'));

  let cart:any=JSON.parse(navParams.get("cart"));
 
       // orderName: 매콤제육볶음 외 2개
  if(cart){
      //add cart into DB
      //read cart info from DB;
      this.carts.push(cart);
  }else{
      // read cart info from DB;
  }
      cart={"takitId":"서울창업허브@완니","amount":0,"orderList":{"takitId":"서울창업허브@완니","menus":[{"menuNO":"서울창업허브@완니;1","menuName":"팟타이","quantity":1,"options":[],"price":7000,
          "unitPrice":7000,"takeout":"1"}]},"deliveryArea":null,"freeDelivery":null,"deliveryFee":null,"address":"서울시 마포구 백범로31길 21 3층 키친인큐베이터","paymethod":{"card":"2%","cash":"5%"},"shopName":"완니","price":7000,"orderName":"팟타이(1)"};

this.carts.push(cart);

  cart={"takitId":"세종대@더큰도시락","amount":0,"orderList":{"takitId":"세종대@더큰도시락","menus":[{"menuNO":"세종대@더큰도시락;1","menuName":"데리치킨도시락","quantity":1,"options":[{"name":"밥곱빼기","price":"200","number":2},{"name":"돈까스한장","price":"1000","number":1},{"name":"스팸한장","price":"1000","number":1},{"name":"계란후라이","price":"0","number":1,"select":"반숙"}],"price":6000,"unitPrice":6000,"takeout":"2"}]},"deliveryArea":"세종대학교내","freeDelivery":"10000","deliveryFee":"3000","address":"서울시 광진구 군자로 121, 지하 1층","paymethod":{"cash":"5%"},"shopName":"더큰도시락","price":6000,"orderName":"데리치킨도시락(1)"};
this.carts.push(cart);


/*   
let approval={"code":0,"message":null,"response":{"amount":7600,"apply_num":"44996081","bank_code":null,"bank_name":null,"buyer_addr":null,"buyer_email":null,"buyer_name":null,"buyer_postcode":null,"buyer_tel":null,"cancel_amount":0,"cancel_history":[],"cancel_reason":null,"cancel_receipt_urls":[],"cancelled_at":0,"card_code":"361","card_name":"BC\uce74\ub4dc","card_quota":0,"cash_receipt_issued":false,"currency":"KRW","custom_data":null,"escrow":false,"fail_reason":null,"failed_at":0,"imp_uid":"imps_726114047287","merchant_uid":"help-ios@takit.biz_1516412824592_1516698","name":"\ud53c\uc26c\ucfe0\uc2a4\ucfe0\uc2a4(1)","paid_at":1516698113,"pay_method":"card","pg_provider":"danal_tpay","pg_tid":"201801231801514440791400","receipt_url":"https:\/\/www.danalpay.com\/receipt\/creditcard\/view.aspx?dataType=receipt&cpid=9810030929&data=mOL6bImoIePnqyxDH0jSsH9Q7FyrGtAIV4AErsL1LBiPEDU1xiwAQLo48NbMFGlm","status":"paid","user_agent":"sorry_not_supported_anymore","vbank_code":null,"vbank_date":0,"vbank_holder":null,"vbank_name":null,"vbank_num":null}};

console.log(approval.response);
console.log(approval.response.imp_uid);
console.log(approval.response.apply_num);


this.order={"orderId":"869","takitId":"세종대@더큰도시락","shopName":"더큰도시락","orderName":"데리치킨도시락(1)","payMethod":"cash","amount":"3420","takeout":"0","arrivalTime":null,"orderNO":"9","userId":"119","userName":"이경주","userPhone":"01027228226","orderStatus":"paid","orderList":"{\"takeout\":\"2\",\"menus\":[{\"menuNO\":\"세종대@더큰도시>락;1\",\"menuName\":\"데리치킨도시락\",\"quantity\":1,\"options\":[{\"name\":\"계란후라이\",\"price\":\"0\",\"number\":1,\"select\":\"반숙\"}],\"price\":3600,\"amout\":3420}]}","deliveryAddress":null,"userMSG":null,"orderedTime":"2018-01-23 00:38:56","checkedTime":null,"completedTime":null,"cancelledTime":null,"localCancelledTime":null,"cancelReason":null,"localOrderedTime":"2018-01-23 09:38:56","localOrderedDay":"2","localOrderedHour":"9","localOrderedDate":"2018-01-23","receiptIssue":"0","receiptId":"","receiptType":"IncomeDeduction","deliveryFee":null,"payment":"cash"};

this.order.orderListObj=JSON.parse(this.order.orderList);

console.log("order.orderList:"+this.order.orderList);
console.log("menus:"+JSON.stringify(this.order.orderListObj.menus[0]));
    this.order.price=0;
    for(var i=0;i<this.order.orderListObj.menus.length;i++)
        this.order.price+= this.order.orderListObj.menus[i].price;
        console.log("price:"+this.order.price);
*/
    this.carts.forEach((cart)=>{
      cart.hidden=true;
    });
    this.computeTotalAmount();
  }

  computeTotalAmount(){
    this.totalAmount=0;
    this.carts.forEach(cart=>{
        cart.orderList.menus.forEach((menu)=>{
          console.log(" "+menu.unitPrice+" "+menu.quantity);
            let unitPrice:number=menu.unitPrice;
            let quantity:number=menu.quantity;
            this.totalAmount+=menu.unitPrice*menu.quantity;
        });
    });
    console.log("totalAmount:"+this.totalAmount);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CartPage');
  }

  hideShopInfo(cart){
    cart.shopHidden=true;
  }

  showShopInfo(cart){
    cart.shopHidden=false;;
  }

  decrease(menu,cart){
      if(menu.quantity>1){
        menu.quantity--;
        this.computeTotalAmount();
      }else{
              let confirm = this.alertCtrl.create({
              title: menu.menuName +'를(을) 삭제하시겠습니까?',
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
                    if(cart.orderList.menus.length==1){
                        let index=this.carts.indexOf(cart);
                        this.carts.splice(index,1);
                    }else{
                        let index=cart.orderList.menus(menu);
                        cart.orderList.menus.splice(index,1);                        
                    }
                    this.computeTotalAmount();
                  }
                }
              ]
            });
            confirm.present();      
      }
  }

  increase(menu){
      menu.quantity++;
      this.computeTotalAmount();
  }

  remove(menu,cart){
      if(cart.orderList.menus.length==1){
          let index=this.carts.indexOf(cart);
          this.carts.splice(index,1);
      }else{
          let index=cart.orderList.menus(menu);
          cart.orderList.menus.splice(index,1);                        
      }
      this.computeTotalAmount();
}

  removeAll(){
    this.carts=[];
    this.computeTotalAmount();
  }

  doOrder(){
    let param;
    param={carts:this.carts, trigger:'cart' }
    console.log("param...:"+JSON.stringify(param));
    this.navCtrl.push(PaymentPage,{order: JSON.stringify(param) ,class:"PaymentPage" });
  }

  readCarts(){
    // construct carts from DB
  }

  saveCarts(){
    // save carts into DB
  }
}
