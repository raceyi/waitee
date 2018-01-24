import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {PaymentPage} from '../payment/payment';

/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  menu;
  shopInfo;

  options:any;
  choice;   
  amount:number;

  quantityInputType;  
  ingredientShown=false;

  optionAmount:number=0;  // 

  memo;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public alertController:AlertController,
              public storageProvider:StorageProvider) {
    this.menu=JSON.parse(navParams.get('menu'));
    this.shopInfo=JSON.parse(navParams.get('shopInfo'));

    if(this.menu.options && this.menu.options!='null'){
          if(typeof this.menu.options ==="string"){
            this.options=JSON.parse(this.menu.options);
          }else{
            this.options=this.menu.options;
          }

          this.options.forEach(option => {
              option.number=0;
          });          
          this.options.forEach((option)=>{
              option.flag=false;
              if(option.hasOwnProperty("choice") && Array.isArray(option.choice)){
                  if(option.hasOwnProperty("default")){
                        console.log("default:"+option.default);
                        option.number=1;
                        option.select=option.default;      
                  }else
                        option.select=undefined;
              }
          });
    }else{
      this.options=[];
    }
    console.log("menu:"+JSON.stringify(this.menu));
    this.menu.quantity = 1;
    this.computeAmount();
    this.quantityInputType="select";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  back(){
    this.navCtrl.pop();  
  }

 computeAmount(){
    this.amount = this.menu.price*this.menu.quantity;
    this.optionAmount=0;
    this.options.forEach(option => {
        if(option.number>0){
            console.log(option.name+":"+option.price*option.number*this.menu.quantity);
            this.optionAmount+=(option.price*option.number)*this.menu.quantity;
        }
    });
    this.amount+=this.optionAmount;
    console.log("total amount:"+this.amount);
 }

 increase(option){
     option.number++;
     this.computeAmount();
 }

 decrease(option){
     if(option.number==0)
         return;
     option.number--;
     this.computeAmount();
 }
 
  quantityInput(flag){
   console.log("flag:"+flag+" quantityInputType:"+this.quantityInputType);
    if(flag){ // number selection
      if(this.quantityInputType=="select"){
        return false;
      }else  
        return true;   
    }else{ //text input
      if(this.quantityInputType=="select"){
        return true;
      }else{
        return false;   
      }
    }
  }

  getQuantity(quantity){
      console.log("quantity change:"+quantity);
      
      if(this.quantityInputType=="input")
              return;
      if(quantity==6){ // show text input box 
          this.quantityInputType="input";
          //this.quantity=undefined;
          this.menu.quantity=1; //keypad doesn't work if quantity is undefined.
      }else{
          this.quantityInputType="select";
          this.computeAmount();
      }
  }

  onBlur(event){
      console.log("onBlur this.quantity:"+this.menu.quantity);
    if(this.menu.quantity==undefined || this.menu.quantity==0 || this.menu.quantity.toString().length==0){
          let alert = this.alertController.create({
                      title: '수량을 입력해주시기바랍니다.',
                      buttons: ['OK']
                    });
                    alert.present();
    }else{
          this.computeAmount();
    }      
  }

  checkOptionValidity(){
     return new Promise((resolve, reject)=>{
            var i;
            console.log("options:"+JSON.stringify(this.options));
            if(this.options!=undefined && this.options!=null && Array.isArray(this.options)){
                for(i=0;i<this.options.length;i++){
                        var option=this.options[i];
                        if(option.number>0 && option.hasOwnProperty("choice")){
                            console.log("option.selectedChoice:"+option.default);
                            if(option.select === undefined || option.select === null){
                                reject(option.name);
                            }
                        }
                }
            }
            resolve();
     });
  }


  order(){

    if(this.menu.quantity==undefined || this.menu.quantity==0 || this.menu.quantity.toString().length==0){
          let alert = this.alertController.create({
                      title: '수량을 입력해주시기바랍니다.',
                      buttons: ['OK']
                    });
                    alert.present();
    }else{
          this.computeAmount();
    }

    this.checkOptionValidity().then(()=>{

        var cart:any={takitId:this.shopInfo.takitId,amount:0};
        var options=[];
        if(this.options!=undefined){
            this.options.forEach((option)=>{
                if (option.number>0){
                    if(option.select!=undefined)
                        options.push({name:option.name,price:option.price,number:option.number,select:option.select});
                    else
                        options.push({name:option.name,price:option.price,number:option.number});
                }    
            });
        }
        this.computeAmount();
        let orderName=this.menu.menuName+"("+this.menu.quantity+")";

        let menus=[];
        let menu:any={menuNO:this.menu.menuNO,
                  menuName:this.menu.menuName,
                  quantity:this.menu.quantity,
                  options: options, 
                  price: this.amount,
                  takeout:this.menu.takeout}
       if(this.memo!=undefined)
            menu.memo=this.memo;

        menus.push(menu);
 
        let order:any={ takitId:this.shopInfo.takitId , menus:menus} 

        cart.orderList=order; //menu's original price

        cart.deliveryArea=this.shopInfo.deliveryArea;
        cart.freeDelivery=this.shopInfo.freeDelivery;
        cart.deliveryFee=this.shopInfo.deliveryFee;
        cart.address=this.shopInfo.address;
        cart.paymethod=this.shopInfo.paymethod;
        cart.takitId=this.shopInfo.takitId;
        cart.shopName=this.shopInfo.shopName;
        cart.price=this.amount;
        cart.orderName=orderName;
        let carts=[];
        carts.push(cart);

        let param={carts:carts, trigger:'order' }
        this.navCtrl.push(PaymentPage,{order: JSON.stringify(param) });
    },(name)=>{
          let alert = this.alertController.create({
                      title: name+'을 선택해주시기 바랍니다.',
                      buttons: ['OK']
                    });
                    alert.present();
    });
  }

  cart(){
    this.checkOptionValidity().then(()=>{
        let param={ orderList:[]}
        /*
        this.menu
         param.orderList.orderName;
         param.orderList.takeout;
         param.orderList.freeDelivery;
         param.orderList.deliveryFee;
         param.orderList.address;
         */                
        //takitId, address, menuNo, menuName,options,quantity,price,memo)
        this.navCtrl.push(PaymentPage,{order: JSON.stringify(param) });
        this.navCtrl.pop();
    },(name)=>{
          let alert = this.alertController.create({
                      title: name+'을 선택해주시기 바랍니다.',
                      buttons: ['OK']
                    });
                    alert.present();
    });
  }

  collapse(){
    this.ingredientShown=false;
  }

  expand(){
    this.ingredientShown=true;
  }
}
