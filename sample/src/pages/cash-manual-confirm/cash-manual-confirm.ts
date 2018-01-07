import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import * as moment from 'moment';
/**
 * Generated class for the CashManualConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-manual-confirm',
  templateUrl: 'cash-manual-confirm.html',
})
export class CashManualConfirmPage {
  bankName;
  bank;
  bankListShown=false;
  amount:number;
  memo:string;
  transferDate;
  bankCodeMode:boolean=false;
  bankCode:string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertController:AlertController,
              private storageProvider:StorageProvider) {
      this.defaultTransferDate();
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad CashManualConfirmPage');
  }

  back(){
      this.navCtrl.pop();
  }

  clickBanklistShown(){
    this.bankListShown=!this.bankListShown;
  }

  check(){
  }

  bankCodeInput(){
   this.bankCodeMode=true;
   this.bankListShown=false;
  }

  defaultTransferDate(){
    let d = new Date();

    let mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1); // getMonth() is zero-based
    let dd  = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let hh = d.getHours() <10? "0"+d.getHours(): d.getHours();
    let dString=d.getFullYear()+'-'+(mm)+'-'+dd+'T'+hh+":00"+moment().format("Z");

    this.transferDate=dString;          
  }

bankSelect(bank){
      this.bankCodeMode=false;
      this.bankName=bank.name;
      this.bank=bank;
      this.bankListShown=false;
      console.log("bankListShown:"+this.bankListShown);
  }}
