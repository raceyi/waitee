import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the ConfigurationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-configuration',
  templateUrl: 'configuration.html',
})
export class ConfigurationPage {
  transNo:number;

  constructor(public navCtrl: NavController, 
              private nativeStorage:NativeStorage,
              private storageProvider:StorageProvider,
              private alertCtrl:AlertController,              
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfigurationPage');
  }

  resetTransNo(){
            this.nativeStorage.setItem('lastTransNo',this.transNo.toString()).then((value)=>{
                this.storageProvider.lastTransNo=this.transNo;
                    let alert = this.alertCtrl.create({
                        title: "transNo가 "+this.storageProvider.lastTransNo+"로 설정되었습니다",
                        buttons: ['OK']
                    });
                    alert.present();
            },err=>{
                    let alert = this.alertCtrl.create({
                        title: "transNo설정에 실패했습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
            })  }
}
