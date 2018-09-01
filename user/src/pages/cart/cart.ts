import { Component ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {CartProvider} from '../../providers/cart/cart';
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
              private alertCtrl:AlertController,
              public storageProvider:StorageProvider,
              private cartProvider:CartProvider, 
              private ngZone:NgZone,
              public navParams: NavParams) {
    this.initializeCarts();
  }

  initializeCarts(){
      this.cartProvider.getCartInfo().then((carts:any)=>{
        console.log("initializeCarts:"+JSON.stringify(carts));
        this.ngZone.run(()=>{
            this.carts=carts;
            //read cart info from DB; 
            this.computeTotalAmount();   
            //Add hidden field into each cart             
            this.carts.forEach((cart)=>{ 
              cart.shopHidden=true;
            });
        });
    },err=>{
          let alert = this.alertCtrl.create({
            title: "장바구니정보를 불러오는데 실패했습니다.",
            buttons: ['OK']
        });
        alert.present();
        this.computeTotalAmount();   
        //Add hidden field into each cart             
        this.carts.forEach((cart)=>{ 
          cart.shopHidden=true;
        });
    })  
  }

  computeTotalAmount(){
    this.totalAmount=0;
    this.carts.forEach(cart=>{
        let cartAmount=0;        
        cart.orderList.menus.forEach((menu)=>{
          console.log(" "+menu.unitPrice+" "+menu.quantity);
            let unitPrice:number=menu.unitPrice;
            let quantity:number=menu.quantity;
            menu.price=menu.unitPrice*menu.quantity;
            cartAmount+=menu.unitPrice*menu.quantity;            
            this.totalAmount+=menu.unitPrice*menu.quantity;
        });
        cart.amount=cartAmount;
        cart.price=cartAmount; // price는 db에 저장된 값? price를 이렇게 지정하는게 맞을까? 맞다. 이름을 price대신 amount로 사용할껄...
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
        this.cartProvider.setMenuQuantity(menu.id,menu.quantity).then(()=>{
        },err=>{
            let alert = this.alertCtrl.create({
                title: "장바구니정보 업데이트에 실패했습니다.",
                buttons: ['OK']
            });
            alert.present();
        });        
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
                    this.cartProvider.setMenuQuantity(menu.id,menu.quantity).then(()=>{
                    },err=>{
                        let alert = this.alertCtrl.create({
                            title: "장바구니정보 업데이트에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
                    });                    
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
      this.cartProvider.setMenuQuantity(menu.id,menu.quantity).then(()=>{
      },err=>{
          let alert = this.alertCtrl.create({
              title: "장바구니정보 업데이트에 실패했습니다.",
              buttons: ['OK']
          });
          alert.present();
      });
      this.computeTotalAmount();
  }

  remove(menu,cart){
    console.log("remove");
    this.cartProvider.deleteMenu(menu.id).then(()=>{
    },err=>{
        let alert = this.alertCtrl.create({
            title: "장바구니정보를 삭제하는데 실패했습니다.",
            buttons: ['OK']
        });
        alert.present();
    });
    if( cart.orderList.menus.length==1){
        let index=this.carts.indexOf(cart);
        this.carts.splice(index,1);
    }else{
        /*
        let index=cart.orderList.menus.indexOf(menu);
        cart.orderList.menus.splice(index,1);
        */   
        this.initializeCarts(); // how to know timeConstraints of this menu? 다시 읽어와야만 한다 ㅜㅜ                     
    }
    console.log("remove done: "+JSON.stringify(this.carts));
    this.computeTotalAmount();
}

  removeAll(){
    console.log("removeAll");
    this.cartProvider.deleteAll().then(()=>{
    },(err)=>{
        let alert = this.alertCtrl.create({
            title: "장바구니정보를 삭제하는데 실패했습니다.",
            buttons: ['OK']
        });
        alert.present();
    });
    this.carts=[];
    this.computeTotalAmount();
  }

  checkAddressValidityCart(){
    if(this.carts.length==1)
        return true;
    let address=this.carts[0].address;    
    for(var i=1;i<this.carts.length;i++)
        if(this.carts[i].address!=address)
          return false;
    return true;          
  }

  doOrder(){
    if(this.carts.length>0){

        if(!this.checkAddressValidityCart()){   //동일상점 주소에서 대해서만 장바구니 주문이 가능합니다.
            let alert = this.alertCtrl.create({
                subTitle: '동일상점 주소에서 대해서만 장바구니 주문이 가능합니다.',
                buttons: ['OK']
            });
            alert.present().then(()=>{
                console.log("alert done");
            });
            return;           
        }
        let param;
        param={carts:this.carts, trigger:'cart' }
        console.log("param...:"+JSON.stringify(param));
        this.navCtrl.push(PaymentPage,{order: JSON.stringify(param) ,class:"PaymentPage" });
    }
  }

  back(){
      this.navCtrl.pop();
  }
}
