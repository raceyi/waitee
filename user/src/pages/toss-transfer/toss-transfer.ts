import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the TossTransferPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-toss-transfer',
  templateUrl: 'toss-transfer.html',
})
export class TossTransferPage {
  amount:number;
  amountString:string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public serverProvider:ServerProvider,
              public alertCtrl:AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TossTransferPage');
  }

  inputAmount(){
    console.log("inputPrice ");
    if(this.amountString){
        let numberString=this.amountString.replace(/,/gi, "");
        let number=parseInt(numberString);
        console.log("boolean:"+(parseInt(numberString).toString()==="NaN"));
        if(parseInt(numberString)==NaN || numberString.length==0){
            number=0;
        }
        console.log("[inputPrice]number:"+number+"priceString"+this.amountString);
        this.amountString=number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }else{
        this.amountString="";
    }
  }

  launchToss(){
     console.log("launchToss");

    let numberString=this.amountString.replace(/,/gi, "");
    let number=parseInt(numberString);

    if(parseInt(numberString)==NaN || numberString.length==0){
        number=0;
    }

    if(number==0){
        let alert = this.alertCtrl.create({
                    title: '충전금액은 0보다 커야 합니다.',
                    buttons: ['OK']
                });
        alert.present();
        return;
    }

     this.serverProvider.launchToss(number).then(link=>{
        this.navCtrl.pop();
     },err=>{
         //just ignore it
     });
  }

  back(){
    this.navCtrl.pop();
  }
}
