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
  amount:number; // price*quantity+option
  quantityInputType;
  options;
  optionAmount:number=0;   
  choice;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertController:AlertController,
              public storageProvider:StorageProvider) {
    this.menu=JSON.parse(navParams.get('menu'));


     if(this.menu.options){
          if(typeof this.menu.options ==="string"){
            this.options=JSON.parse(this.menu.options);
          }else{
            this.options=this.menu.options;
          }
          
          this.options.forEach((option)=>{
              option.flag=false;
              if(option.hasOwnProperty("choice") && Array.isArray(option.choice)){
                  if(option.hasOwnProperty("default")){
                      console.log("default:"+option.default);
                        for(let i=0;i<option.choice.length;i++){
                            if(option.choice[i]==option.default){
                                    option.flag=true;
                            }
                        }
                  }
              }
          });
      }



    this.menu.options=JSON.parse(this.menu.options);
    this.menu.options.forEach(option => {
        if(!option.hasOwnProperty("number"))
              option.number=0;
    });
    console.log("menu:"+JSON.stringify(this.menu));
    this.menu.quantity = 1;
    this.quantityInputType="select";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
  }

  back(){
    console.log("back comes");
    this.navCtrl.pop();  
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
          this.menu.quantity=1; //keypad doesn't work for password if quantity is undefined.
      }else{
          this.quantityInputType="select";
          this.menu.amount=this.menu.price*quantity;
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
        var unitPrice=this.menu.price;
        this.options.forEach(option=>{
            if(option.flag){
                unitPrice+=option.price;
            }
        });
        console.log("unitPrice:"+unitPrice);
          this.menu.amount=unitPrice*this.menu.quantity;
    }      
  }

  order(){




    
    this.navCtrl.push(PaymentPage);
  }

}
