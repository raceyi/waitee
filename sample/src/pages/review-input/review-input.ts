import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

  fontColor=["#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2","#f2f2f2"];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.order=JSON.parse(this.navParams.get("order"));
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
          this.fontColor[index]="#6441a5";
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
}
