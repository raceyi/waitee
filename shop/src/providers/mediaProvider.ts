import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Media, MediaObject } from '@ionic-native/media';
import { Platform } from 'ionic-angular';
import {StorageProvider} from './storageProvider';

declare var cordova:any;

/*
  Generated class for the MediaProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MediaProvider {
   playing:boolean=false;
             
   file:MediaObject;
   volumeControl;

   warning:MediaObject;

  constructor(public http: Http,private platform:Platform,
              private media: Media,private storageProvider:StorageProvider,) {
    console.log('Hello MediaProvider Provider');
    platform.ready().then(() => {
      if(this.storageProvider.device){
          this.volumeControl = cordova.plugins.VolumeControl;

          if(this.platform.is('android'))
            this.file = this.media.create('file:///android_asset/www/assets/ordersound.mp3');
          else{
            this.file = this.media.create('assets/ordersound.mp3');
          }
          this.file.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes
          this.file.onSuccess.subscribe(() => {
            console.log('Action is successful');
            if(this.playing)
              this.file.play();
            
          });
          this.file.onError.subscribe(error => console.log('Error! '+JSON.stringify(error)));
          /////////////////////////////////////////////////////// 
          if(this.platform.is('android'))
              this.warning = this.media.create('file:///android_asset/www/assets/warning.mp3');
            else{
              this.warning = this.media.create('assets/warning.mp3');
            }
          this.warning.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes
          this.warning.onSuccess.subscribe(() => {
            console.log('Action is successful');        
          });
          this.warning.onError.subscribe(error => console.log('Error! '+JSON.stringify(error)));
      }
    });

  }

  playWarning(){
      this.volumeControl.setVolume(this.storageProvider.volume/100);
      // play the file
      this.warning.play();      
  }

  play(){
          this.playing=true;
          this.volumeControl.setVolume(this.storageProvider.volume/100);
          // play the file
          this.file.play();
          console.log("play ordersound.mp3");
          //file.release(); hum... where should I call this function?
  }

  stop(){
    console.log("mediaProvider - stop");
    if(this.playing){
      this.playing=false;
      this.file.stop();
    }
  }

  release(){ //When should I call this function? When app terminates?

  }

  setVolume(volume){
    if(this.playing){
        this.file.setVolume(volume);
    }
  }
}
