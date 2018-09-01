import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the CartProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CartProvider {
  orderName="";
  orderList=[];
  totalAmount=0;
  totalQuantity=0;
  takeoutAvailable=false;

  constructor(public http: HttpClient) {
    console.log('Hello CartProvider Provider');
  }

  countQuantity(){
    let total=0;
    this.orderList.forEach(menu=>{
        total+=menu.quantity;
    })
    return total;
  }
  
  computeAmount(){
    let total=0;
    this.orderList.forEach(menu=>{
        total+=menu.amount;
    })
    return total;
  }

  addCart(menu){
    console.log("addCart:"+JSON.stringify(menu));
    this.orderList.push(menu);
    this.orderName=this.orderList[0].menuName+"외"+this.countQuantity()+'개';
    this.totalAmount=this.computeAmount();
    this.totalQuantity=this.countQuantity();
    this.checkTakeoutAvailable();
  }

  resetCart(){
    return new Promise((resolve, reject)=>{
        this.totalQuantity=0;
        this.totalAmount=0;
        this.orderList=[];
        this.orderName="";
        this.takeoutAvailable=false;
        resolve();
    });
  }

  removeMenu(menuIndex){
    return new Promise((resolve, reject)=>{
      console.log("removeMenu comes");
        this.orderList.splice(menuIndex,1);
        console.log("this.orderList.length:"+this.orderList.length);
        if(this.orderList.length==0){
            this.orderName="";
            this.totalAmount=0;
            this.totalQuantity=0; 
            this.checkTakeoutAvailable();
        }else{
            this.orderName=this.orderList[0].menuName+" 외 "+this.countQuantity()+'개';
            this.totalAmount=this.computeAmount();
            this.totalQuantity=this.countQuantity(); 
            this.takeoutAvailable=false;
        }    
        console.log("removeMenu resolve"); 
        resolve();
    });
  }

  checkTakeoutAvailable(){
    this.takeoutAvailable=true;      
    for(var i=0;i<this.orderList.length;i++){
        if(this.orderList[i].takeout==undefined
            || this.orderList[i].takeout==null 
            || this.orderList[i].takeout<1){
            this.takeoutAvailable=false;
            return;
        }
    }
  }

}
