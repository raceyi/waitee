import {Component,EventEmitter,NgZone} from "@angular/core";
import {NavController,NavParams,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storageProvider';
import {App} from 'ionic-angular';
import {ServerProvider} from '../../providers/serverProvider';
import {Http,Headers} from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';
import {ConfigurePasswordPage} from '../configure-password/configure-password';

declare var cordova:any;

@Component({
  templateUrl: 'userinfo.html',
  selector:'page-userinfo'
})

export class UserInfoPage{
    
     constructor(public storageProvider:StorageProvider,private alertController:AlertController
        ,private app: App,private navController: NavController, private navParams: NavParams
        ,private serverProvider:ServerProvider,public ngZone:NgZone,private http:Http
        ,private nativeStorage: NativeStorage){
	      console.log("UserInfoPage constructor");
     }

  modifyPassword(){
         this.app.getRootNavs()[0].push(ConfigurePasswordPage);
  }

}

