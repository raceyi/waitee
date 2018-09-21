import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {PaymentPage} from '../payment/payment';
import {CartPage} from '../cart/cart';
import {CartProvider} from '../../providers/cart/cart';

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
  unitPrice:number;

  quantityInputType;  
  ingredientShown=false;

  optionAmount:number=0;  // 

  memo;

  timeConstraint;
  timeConstraintString;
  ignoreUnitPrice:boolean=false;
  ignoreUnitPriceOption:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public alertController:AlertController,
              public cartProvider:CartProvider,
              private ngZone:NgZone,
              public storageProvider:StorageProvider) {
    this.menu=JSON.parse(navParams.get('menu'));
    this.shopInfo=JSON.parse(navParams.get('shopInfo'));
    console.log("this.menu.timeConstraint:"+this.menu.timeConstraint);

    console.log(".....discountOptions:..."+this.menu.menuDiscountOption);
    if(this.menu.menuDiscountOption && this.menu.menuDiscountOption!=null){
        console.log("discountOptions:..."+this.menu.menuDiscountOption);
        this.menu.discountOptions=JSON.parse(this.menu.menuDiscountOption);
    }

    if(this.menu.timeConstraint!=undefined && this.menu.timeConstraint!=null){
        this.timeConstraint=JSON.parse(this.menu.timeConstraint);
        let fromHour,toHour,fromMin,toMin;
        if(this.timeConstraint.toMins && this.timeConstraint.toMins!=null){
            toHour=(this.timeConstraint.toMins-this.timeConstraint.toMins%60)/60;
            toMin= this.timeConstraint.toMins%60;
        }
        if(this.timeConstraint.fromMins && this.timeConstraint.fromMins!=null){
            fromHour=(this.timeConstraint.fromMins-this.timeConstraint.fromMins%60)/60;
            fromMin= this.timeConstraint.fromMins%60;
        }
        //고객앱에서 주문 가능시간 표기
        if(this.timeConstraint.from && this.timeConstraint.from!=null 
            && this.timeConstraint.to && this.timeConstraint.to!=null){
            if(this.timeConstraint.condition=="XOR"){
                this.timeConstraintString="주문가능시간:"+toHour+'시'+toMin+'분 이전',fromHour+'시'+fromMin+'분 이후';
            }else if(this.timeConstraint.condition=="AND"){
                this.timeConstraintString="주문가능시간:"+fromHour+'시'+fromMin+'분-'+toHour+'시'+toMin+'분';            
            }
        }else if(this.timeConstraint.from && this.timeConstraint.from!=null){
            this.timeConstraintString="주문가능시간:"+fromHour+'시'+fromMin+"분 이후";
        }else if(this.timeConstraint.to && this.timeConstraint.to!=null){
            this.timeConstraintString="주문가능시간:"+toHour+'시'+toMin+'분 이전';
        }
        console.log("timeConstraintString:"+this.timeConstraintString);
    }
    console.log("menu.options:"+this.menu.options);

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
              option.flag=false;   // 왜 넣었을까? flagOn이 따로 있는데 ㅜㅜ 삭제해보자. 
              if(option.hasOwnProperty("choice") && Array.isArray(option.choice)){ 
                  if(option.hasOwnProperty("default")){ 
                        console.log("default:"+option.default);
                        if(option.price==0)
                            option.number=1; // 무조건 선택되어야 하는 옵션이다. 
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
    let menu_price:number;
    if( typeof this.menu.price==='string')
        menu_price=parseInt(this.menu.price);
    else
        menu_price=this.menu.price;
        
    let menu_quantity:number;
    if(typeof this.menu.quantity ==='string')
        menu_quantity=parseInt(this.menu.quantity);
    else
        menu_quantity=this.menu.quantity;
        
    this.amount = menu_price*menu_quantity;

    this.unitPrice=menu_price;

    console.log("total amount:"+this.amount);
    this.optionAmount=0;
    this.ignoreUnitPrice=false;
    let ignorePrice=0;

    this.options.forEach(option => {
        if(option.number && option.number>0){
            console.log(option.name+":"+option.price*option.number*this.menu.quantity);
            let price:number;
            if( typeof option.price ==='string')
                 price=parseInt(option.price);
            else  
                 price=option.price;     
            let option_number:number;
            if( typeof option.number ==='string')
                option_number=parseInt(option.number);
            else
                option_number=option.number;
            let quantity:number;
            if( typeof this.menu.quantity ==='string')
                quantity=parseInt(this.menu.quantity);
            else
                quantity=this.menu.quantity;

           this.optionAmount+=(price*option_number)*quantity;
            this.unitPrice=this.unitPrice+(price*option_number);

            console.log(price);
            console.log(option_number);
            console.log(price*option_number);
            console.log("..unitPrice:"+this.unitPrice);            
  
       }else if(option.flagType && option.flagOn){
            let price:number;
            if( typeof option.price ==='string')
                 price=parseInt(option.price);
            else  
                 price=option.price;     
           this.optionAmount+=price*this.menu.quantity;
           this.unitPrice=this.unitPrice+price;
           if(option.extendedOption && option.extendedOption.ignoreUnitPrice && option.extendedOption.flagOn){  
               this.ignoreUnitPrice=true;
               this.ignoreUnitPriceOption=option.extendedOption.name;
               ignorePrice=option.extendedOption.price;
           }
       }
    });
    
    console.log("this.optionAmount:"+this.optionAmount);

    if(!this.ignoreUnitPrice)
        this.amount+=this.optionAmount;
    else /*if(this.ignoreUnitPrice)*/{
        this.amount=ignorePrice; 
        this.unitPrice=ignorePrice;   
    }
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
  // console.log("flag:"+flag+" quantityInputType:"+this.quantityInputType);
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
      if(this.ignoreUnitPrice && quantity!=1){
          let alert = this.alertController.create({
                      title:  this.ignoreUnitPriceOption+'선택시 수량은 반드시 1이어야 합니다.',
                      buttons: ['OK']
                    });
                    alert.present();
                    return;
      }
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
                        if(option.price==0 && option.hasOwnProperty("choice")){
                            if(option.select === undefined || option.select === null){
                                reject(option.name+'의 옵션을 선택해주시기 바랍니다.');
                            }
                        }else if(option.number>0 && option.hasOwnProperty("choice") && option.choice.length>1){
                            console.log("option.selectedChoice:"+option.default);
                            if(option.select === undefined || option.select === null){
                                reject(option.name+'의 옵션을 선택해주시기 바랍니다.');
                            }
                        }else if(option.flagType && option.flagOn && option.hasOwnProperty("choice") && option.choice.length>1){
                            if(option.select === undefined || option.select === null){
                                reject(option.name+'의 옵션을 선택해주시기 바랍니다.');  
                            }                          
                        }
                }
            }
            if(this.ignoreUnitPrice && this.menu.quantity!=1){
                    reject(this.ignoreUnitPriceOption+'선택시 수량은 반드시 1이어야 합니다.');
            }
            resolve();
     });
  }

  removeSpecialCharacters(str){
      var pattern = /^[a-zA-Zㄱ-힣0-9|s]*$/;
        let update="";

        for(let i=0;i<str.length;i++){
             if(str[i].match(pattern) || str[i]===" "){
                update+=str[i];
            }else{
                console.log("NOK-special characters");
            }
        }
        return update;
  }
  command(command){
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
                }else if(option.flagType && option.flagOn){
                    if(option.extendedOption && option.extendedOption.ignoreUnitPrice && option.extendedOption.flagOn){
                        if(option.select!=undefined) 
                            options.push({name:option.name,price:option.price,number:1,select:option.select, extendedOption:option.extendedOption });
                        else
                            options.push({name:option.name,price:option.price,number:1,extendedOption:option.extendedOption });
                    }else{
                        if(option.select!=undefined) 
                            options.push({name:option.name,price:option.price,number:1,select:option.select});
                        else
                            options.push({name:option.name,price:option.price,number:1});                        
                    }
                }    
            });
        }
        this.computeAmount();
        let orderName=this.menu.menuName+"("+this.menu.quantity+")";

        let menus=[];
        let menu:any={menuNO:this.menu.menuNO,
                  menuName:this.menu.menuName,
                  menuDiscount:this.menu.menuDiscount,
                  menuDiscountOption:this.menu.menuDiscountOption,
                  quantity:this.menu.quantity,
                  options: options, 
                  price: this.amount,
                  unitPrice:this.unitPrice,
                  takeout:this.menu.takeout}

       console.log("hum..... unitPrice");           
       if(this.memo!=undefined){
           menu.memo=this.removeSpecialCharacters(this.memo); // 숫자,한글,영문자만 가능합니다. 특수문자 입력 불가.
       }
        menus.push(menu);
 
        let order:any={ takitId:this.shopInfo.takitId , menus:menus} 

        cart.orderList=order; //menu's original price

        cart.timeConstraints=[];
        if(this.timeConstraint!=null && this.timeConstraint!=undefined)
            cart.timeConstraints.push(this.timeConstraint);
        cart.deliveryArea=this.shopInfo.deliveryArea;
        cart.freeDelivery=this.shopInfo.freeDelivery;
        cart.deliveryFee=this.shopInfo.deliveryFee;
        cart.address=this.shopInfo.address;
        cart.paymethod=this.shopInfo.paymethod;
        cart.payInfo=JSON.stringify(this.shopInfo.paymethod); //재주문을 위해 order에 저장함.
        cart.takitId=this.shopInfo.takitId;
        cart.shopName=this.shopInfo.shopName;
        cart.price=this.amount;
        cart.orderName=orderName;
        let carts=[];
        carts.push(cart);

        let param;
        if(command==='order'){
            param={carts:carts, trigger:'order' }
            this.navCtrl.push(PaymentPage,{order: JSON.stringify(param) ,class:"PaymentPage" });
        }else{
            this.cartProvider.addMenuIntoCart(cart).then((res)=>{
                    let confirm = this.alertController.create({
                    title: '장바구니로 이동하시겠습니까?',
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
                                this.navCtrl.push(CartPage,{class:"CartPage"});
                            }
                        }
                    ]
                    });
                    confirm.present();
            },(err)=>{
                        let alert = this.alertController.create({
                            title: "장바구니 정보 업데이트에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
            })
        }
    },(error)=>{
          let alert = this.alertController.create({
                      title: error,
                      buttons: ['OK']
                    });
                    alert.present();
    });
  }

  updateFlag(option){
    this.computeAmount();   
  }

  collapse(){
    this.ingredientShown=false;
  }

  expand(){
    this.ingredientShown=true;
  }

  selectChoice(option){
      if(option.choiceFlag)
          option.select=option.choice[0];
      else
          option.select=undefined;  
      console.log("option.select:"+option.select);    

  }
}
