import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  quantityInputType;

  constructor(public navCtrl: NavController, public navParams: NavParams,public storageProvider:StorageProvider) {
    this.menu=JSON.parse(navParams.get('menu'));
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
          //this.quantity=undefined;
          this.menu.quantity=1; //keypad doesn't work for password if quantity is undefined.
      }else{
          this.quantityInputType="select";
          //this.price=this.menu.price*quantity;
          //this.discount=Math.round(this.price*this.storageProvider.shopInfo.discountRate);
          //this.amount=this.price-this.discount;
      }
  }

  onBlur(event){
      console.log("onBlur this.quantity:"+this.menu.quantity);
    if(this.menu.quantity==undefined || this.menu.quantity==0 || this.menu.quantity.toString().length==0){
/*
           let alert = this.alertController.create({
                      title: '수량을 입력해주시기바랍니다.',
                      buttons: ['OK']
                    });
                    alert.present();
*/                    
    }else{
      /*
        var unitPrice=this.menu.price;
        this.options.forEach(option=>{
            if(option.flag){
                unitPrice+=option.price;
            }
        });
        console.log("unitPrice:"+unitPrice);
          this.price=unitPrice*this.quantity;
          this.discount=Math.round(this.price*this.storageProvider.shopInfo.discountRate);
          this.amount=this.price-this.discount;
      */    
    }      
  }

  order(){
    this.navCtrl.push(PaymentPage);
  }
}
