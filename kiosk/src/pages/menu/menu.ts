import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import { CartProvider } from '../../providers/cart/cart';

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

  constructor(public navCtrl: NavController, 
              public storageProvider:StorageProvider,
              public cartProvider:CartProvider,
              public alertController:AlertController,
              public navParams: NavParams) {
    this.menu=navParams.get('menu');
    console.log("menu:")
    console.log("this.menu.timeConstraint:"+this.menu.timeConstraint);

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

    //Just for testing
    //this.menu.explanation="맛있는 ....................................................";
    //this.timeConstraintString="주문가능시간 오전 9시이후 -오후2시 이전 ";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  back(){
    this.navCtrl.pop();  
  }

 computeAmount(){
    let menu_price:number
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
    this.options.forEach(option => {
        if(option.number>0){
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
  
       }
    });
    this.amount+=this.optionAmount;
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

  addOrder(){
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

        var cart:any={amount:0};
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

        let menu_quantity:number=0;
        if(typeof this.menu.quantity ==='string')
              menu_quantity=parseInt(this.menu.quantity);
        else
              menu_quantity=this.menu.quantity;

        let menu:any={menuNO:this.menu.menuNO,
                  menuName:this.menu.menuName,
                  quantity:menu_quantity,
                  options: options, 
                  amount: this.amount,
                  unitPrice:this.unitPrice,
                  takeout:this.menu.takeout}

       if(this.memo!=undefined){
           menu.memo=this.removeSpecialCharacters(this.memo); // 숫자,한글,영문자만 가능합니다. 특수문자 입력 불가.
       }
       if(this.timeConstraint!=null && this.timeConstraint!=undefined){
            menu.timeConstraints=this.timeConstraint;
       }
       console.log("menu:"+JSON.stringify(menu));
       this.cartProvider.addCart(menu); 
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
