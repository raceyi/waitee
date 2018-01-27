import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import {Platform} from 'ionic-angular';

/*
  Generated class for the CartProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CartProvider {
    public db:SQLiteObject;

  constructor(private sqlite: SQLite,
              platform: Platform) {
    console.log('Hello CartProvider Provider');
        platform.ready().then(() => {
            // this.open();  call it in tabs constructor 
    });
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////
    getCartInfo(){
        //console.log("getCartInfo-enter");
        return new Promise((resolve,reject)=>{
                var queryString='SELECT * FROM carts order by takitId';
                //console.log("call queryString:"+queryString);
                this.db.executeSql(queryString,[]).then((resp)=>{ // What is the type of resp? 
                    console.log("query result:"+JSON.stringify(resp));
                    var output=[];
                    if(resp.rows.length>=1){
                        //console.log("item(0)"+JSON.stringify(resp.rows.item(0)));
                        for(var i=0;i<resp.rows.length;i++)
                            output.push(resp.rows.item(i)); 
                    }else if(resp.rows.length==0){
                        console.log(" no cart info");
                    }
                    if(output.length>0){
                        let carts=[];
                        let takitId=output[0].takitId;
                        let rows=[];
                        for(var j=0;j<output.length;j++){
                            if(output[j].takitId==takitId){
                                rows.push(output[j]);
                            }else{
                                let cart=this.convertOneCartInfo(rows);
                                carts.push(cart);
                                rows=[];
                                takitId=output[j].takitId;
                                rows.push(output[j]);
                            }
                        }
                        // the last one
                        let cart=this.convertOneCartInfo(rows);
                        carts.push(cart);
                        resolve(carts);
                    }
                    resolve(output);
                },(e) => {
                     reject("DB error "+JSON.stringify(e));
                });
         });
    }

 dropCartInfo(){
       return new Promise((resolve,reject)=>{
           this.db.executeSql("drop table if exists carts",[]).then(
               ()=>{
                    console.log("success to drop cart table");
                    resolve();
           }).catch(e => {
                    console.log("fail to drop cart table "+JSON.stringify(e));
                    reject();
                },);
       });
   }

       addMenuIntoCart(cart){ 
      return new Promise((resolve,reject)=>{  
            console.log("addMenuIntoCart "+JSON.stringify(cart));
            let queryString:string;
            let takeout:number=cart.orderList.menus[0].takeout; //hum... takeout comes as string.

            let params=[cart.takitId,
                        cart.address,
                        cart.deliveryArea,
                        cart.freeDelivery,
                        cart.deliveryFee, 
                        JSON.stringify(cart.paymethod),
                        cart.shopName,
                        JSON.stringify(cart.orderList.menus[0].options),
                        cart.orderList.menus[0].unitPrice,
                        cart.orderList.menus[0].quantity,
                        takeout,
                        cart.orderList.menus[0].memo,
                        cart.orderList.menus[0].menuNO, 
                        cart.orderList.menus[0].menuName];

            console.log("!!!!params:"+JSON.stringify(params));

            queryString="INSERT INTO carts(takitId, address, deliveryArea, freeDelivery, deliveryFee,paymethod, shopName, options,unitPrice, quantity,takeout,memo, menuNO, menuName) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,params).then((resp)=>{
                console.log("[saveCartInfo]resp:"+JSON.stringify(resp));
                    console.log("id:"+resp.insertId);
                    //"rows":{"length":0},"rowsAffected":1,"insertId":1}
                    resolve(resp.insertId);
            },(e) => {
                console.log("addMenuIntoCart error:"+JSON.stringify(e));
                reject(e);
                //reject("DB error");
            });
      });
    }

    deleteMenu(uniqueId){
      return new Promise((resolve,reject)=>{  
            console.log("deleteMenu:"+uniqueId);
            let queryString:string;
            queryString="DELETE FROM carts where id=?";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[uniqueId]).then((resp)=>{
                console.log("[deleteMenu]resp:"+JSON.stringify(resp));
                resolve(resp);
            }).catch(e => {
                console.log("deleteMenu error:"+JSON.stringify(e));
                reject("DB error");
            });
      });
    }

   deleteAll(){
      return new Promise((resolve,reject)=>{  
            console.log("deleteAll");
            let queryString:string;
            queryString="DELETE from carts;";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[]).then((resp)=>{
                console.log("[deleteAll]resp:"+JSON.stringify(resp));
                resolve(resp);
            }).catch(e => {
                console.log("deleteAll error:"+JSON.stringify(e));
                reject("DB error");
            });
      });     
   }

   setMenuQuantity(uniqueId,quantity){
      return new Promise((resolve,reject)=>{  
            console.log("setMenuQuantity");
            let queryString="UPDATE carts SET quantity=? WHERE id=?";
            console.log("query:"+queryString);
            this.db.executeSql(queryString,[quantity,uniqueId]).then((resp)=>{
                console.log("[setMenuQuantity]resp:"+JSON.stringify(resp));
                resolve(resp);
            },e => {
                console.log("setMenuQuantity  error:"+JSON.stringify(e));
                reject("DB error");
            });
      });     
        
   }

       open(){
        return new Promise((resolve,reject)=>{
            var options={
                    name: "takitCart.db",
                    location:'default'
            };
            console.log("call create function")            
            this.sqlite.create(options)
            .then((db: SQLiteObject) => {
                this.db=db;
                this.db.executeSql("create table if not exists carts(id integer primary key autoincrement, \
                 takitId VARCHAR(100),\
                 address VARCHAR(255), \
                 deliveryArea VARCHAR(255),\
                 freeDelivery int,\
                 deliveryFee int,\
                 paymethod VARCHAR(60),\
                 shopName VARCHAR(50),\
                 options VARCHAR(255), \
                 unitPrice int,\
                 quantity int,\
                 takeout int,\
                 memo varchar(400),\
                 menuNO VARCHAR(100),\
                 menuName VARCHAR(100));",[]).then(()=>{
                    console.log("success to create cart table");
                    resolve();
                }).catch(e => {
                    console.log("fail to create table"+JSON.stringify(e));
                    reject(e); // just ignore it if it exists. hum.. How can I know the difference between error and no change?
                });
            }).catch(e =>{
                console.log("fail to open database"+JSON.stringify(e));
                reject(e);
            });
        });

    }

    convertOneCartInfo(rows){ // same shop
       let cart:any={takitId:rows[0].takitId,amount:0};
       let totalQuantity=0;
       let menus=[];

       rows.forEach(row=>{
            totalQuantity+=row.quantity;
            let menu:any={
                  id:row.id,
                  menuNO:row.menuNO,
                  menuName:row.menuName,
                  quantity:row.quantity,
                  options: JSON.parse(row.options), 
                  //price: row.unitPrice*row.quantity,
                  unitPrice:row.unitPrice,
                  takeout:row.takeout,
                  memo:row.memo}
              menus.push(menu)    
       });
        let orderName;

        if(rows.length==1){
            orderName=rows[0].menuName+"("+rows[0].quantity+")";
        }else{
            orderName=rows[0].menuName+"외 "+totalQuantity;
        }
 
        let order:any={ takitId:rows[0].takitId , menus:menus} 

        cart.orderList=order; //menu's original price

        cart.deliveryArea=rows[rows.length-1].deliveryArea;
        cart.freeDelivery=rows[rows.length-1].freeDelivery;
        cart.deliveryFee=rows[rows.length-1].deliveryFee;
        cart.address=rows[rows.length-1].address;
        cart.paymethod=JSON.parse(rows[rows.length-1].paymethod);
        cart.takitId=rows[rows.length-1].takitId;
        cart.shopName=rows[rows.length-1].shopName;
        //cart.price=this.amount;

        cart.orderName=orderName;
        this.computeCartPrice(cart);
        console.log("cart:"+JSON.stringify(cart));
        return cart;
    }
    
    computeCartPrice(cart){
        cart.price=0;
        cart.orderList.menus.forEach(menu=>{
            menu.price=menu.unitPrice*menu.quantity;
            cart.price+=menu.price;
        });
    }    
}
