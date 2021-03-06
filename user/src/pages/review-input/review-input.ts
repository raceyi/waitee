import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,Events } from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the ReviewInputPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-review-input',
  templateUrl: 'review-input.html',
})
export class ReviewInputPage {
  order;
  count=0;
  review;

  fontColor=["#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2"];
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public events: Events,
              private alertCtrl:AlertController,              
              public storageProvider:StorageProvider,              
              public serverProvider:ServerProvider) {
    this.order=this.navParams.get("order");
    console.log("order:"+JSON.stringify(this.order));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReviewInputPage');
  }

  back(){
    this.navCtrl.pop();
  }

  markStar(index){ // button의 toggle이 되어야 한다. 
    console.log("count:"+this.count+" index:"+index);
    if(this.count==index){
      if(this.fontColor[index]=="#f2f2f2"){
          this.fontColor[index]="#FF5F3A";
          if(this.count<5)
              this.count++;
      }
    }else if(this.count-1==index){
          this.fontColor[index]="#f2f2f2";          
          if(this.count>0)
              this.count--;
    }
    return;
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

  inputDone(){
    let review:string=this.review;
    if(this.count==0){
        let alert = this.alertCtrl.create({
            subTitle: '별점을 입력해주세요. 별점은 1부터 입력가능합니다.',
            buttons: ['OK']
        });
        alert.present();
        return;
    }
    if(!review || review.trim().length==0){
        let alert = this.alertCtrl.create({
            subTitle: '고객님의 평가를 입력해주시기 바랍니다.',
            buttons: ['OK']
        });
        alert.present();
        return;
    }
    console.log("count:"+this.count);
    console.log("orderId:"+this.order.orderId);
    console.log("takitId:"+this.order.takitId);

    let body = {orderId:this.order.orderId,
                fiveStar:this.count,
                review:this.removeSpecialCharacters(this.review),
                takitId:this.order.takitId};   

    this.serverProvider.post(this.storageProvider.serverAddress+"/shop/inputReview",body).then((res:any)=>{
        let order=this.order;
        console.log("ordoer:"+JSON.stringify(order));
        order.review=this.review;
        order.starRate=this.count;
        this.events.publish('orderUpdate',{order:order});
        this.navCtrl.pop();
        let alert = this.alertCtrl.create({
            subTitle: '고객님의 평가가 반영되었습니다.',
            buttons: ['OK']
        });
        alert.present();
    });
  }
}
