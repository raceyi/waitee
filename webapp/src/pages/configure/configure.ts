import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,Platform,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storageProvider';
import {ServerProvider} from '../../providers/serverProvider';

/**
 * Generated class for the ConfigurePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova:any;

@IonicPage()
@Component({
  selector: 'page-configure',
  templateUrl: 'configure.html',
})
export class ConfigurePage {
  volumeValue=0;
  play:boolean=false;
  volumeControl;
  //systemVolume;
  storeColor="gray";
  notiColor="gray";
  pollingInterval;
  weeks:any=[{name:"일요일"},{name:"월요일"},{name:"화요일"},{name:"수요일"},{name:"목요일"},{name:"금요일"},{name:"토요일"}];
  hours=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  mins=[0,5,10,15,20,25,30,35,40,45,50,55];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private storageProvider:StorageProvider,
              private alertController:AlertController,
              private serverProvider:ServerProvider,
              private platform:Platform) {
    platform.ready().then(() => {
      if(this.storageProvider.device){  
          this.volumeControl = cordova.plugins.VolumeControl;
          this.volumeControl.getVolume((value)=>{
            console.log("system volume:"+value);
            //this.systemVolume=value;
            this.volumeControl.setVolume(this.storageProvider.volume/100);
            this.volumeValue=this.storageProvider.volume;
          });
      }
      this.pollingInterval=this.storageProvider.pollingInterval;         
    });

    if(this.storageProvider.myshop.GCMNoti=="off"){
      this.notiColor="gray";
    }else if(this.storageProvider.myshop.GCMNoti=="on"){
      this.notiColor="#33b9c6";
    }else{
      console.log("unknown GCMNoti");
    }

    console.log("!!! storeOpen:"+this.storageProvider.storeOpen);
    if(this.storageProvider.storeOpen==true){
      this.storeColor="#33b9c6";
    }else{ 
      this.storeColor="gray";  
    }
    /////////////////////////////////////////////////////////////////

    let weeksString=JSON.parse(this.storageProvider.shopInfo.businessTime); 
    for(let i=0;i<weeksString.length;i++){
         console.log("i:"+i+" "+this.weeks[i].name);
        let dayString=weeksString[i];
        this.weeks[i].startHour=parseInt(dayString.substr(0,2));
        this.weeks[i].startMin=parseInt(dayString.substr(3,2));
        this.weeks[i].endHour=parseInt(dayString.substr(6,2));
        this.weeks[i].endMin=parseInt(dayString.substr(9,2));
    }
    console.log("weeks:"+JSON.stringify(this.weeks));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfigurePage');
    this.volumeValue=this.storageProvider.volume;
    this.pollingInterval=this.storageProvider.pollingInterval;    
  }

  updateVolume(){
    if(!this.play){
        this.play=true;
        //this.mediaProvider.play();
    }
     this.volumeControl.setVolume(this.volumeValue/100);   
     this.storageProvider.saveVolume(this.volumeValue);
    console.log("!!!! volumeValue: "+this.volumeValue/100);  
  }

  ionViewWillLeave(){
    if(this.play){
        this.play=false;
        //this.mediaProvider.stop();
        console.log("ionViewWillLeave:"+this.volumeValue);
        this.storageProvider.saveVolume(this.volumeValue);
    }
    this.storageProvider.savepollingInterval(this.pollingInterval);
    console.log("this.pollingInterval:"+this.pollingInterval);
  }

  configureStore(){
    console.log("click-configureStore(storeOpen):"+this.storageProvider.storeOpen);
    if(this.storageProvider.tourMode){
          let alert = this.alertController.create({
                      title: '상점문을 열고,닫습니다. ',
                      subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                      buttons: ['OK']
                  });
          alert.present();
      return;
    }
    if(this.storageProvider.storeOpen===false){
      let alert = this.alertController.create({
                        title: '상점문을 여시겠습니까?',
                        buttons: [{
                            text:'아니오',
                            handler:()=>{
                              console.log("Disagree clicked");
                            }
                          },
                          {
                            text:'네',
                            handler:()=>{
                              this.openStore().then(()=>{
                                  console.log("open shop successfully");
                                  this.storeColor="#33b9c6";
                                  this.storageProvider.storeOpen=true;
                              },(err)=>{
                                  if(err=="NetworkFailure"){
                                    let alert = this.alertController.create({
                                                      title: '서버와 통신에 문제가 있습니다',
                                                      subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                      buttons: ['OK']
                                                  });
                                    alert.present();
                                  }else{
                                    let alert = this.alertController.create({
                                                      title: '샵을 오픈하는데 실패했습니다.',
                                                      subTitle: '고객센터(0505-170-3636)에 문의바랍니다.',
                                                      buttons: ['OK']
                                                  });
                                    alert.present();
                                  }
                              });
                            }}]
                          });
                          alert.present();
    }else{
      let alert = this.alertController.create({
                        title: '상점문을 닫으시겠습니까?',
                        buttons: [{
                            text:'아니오',
                            handler:()=>{
                              console.log("Disagree clicked");
                            }
                          },
                          {
                            text:'네',
                            handler:()=>{
                                this.closeStore().then(()=>{
                                    console.log("close shop successfully");
                                    this.storeColor="gray";
                                    this.storageProvider.storeOpen=false;
                                },(err)=>{
                                    if(err=="NetworkFailure"){
                                      let alert = this.alertController.create({
                                                        title: '서버와 통신에 문제가 있습니다',
                                                        subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                        buttons: ['OK']
                                                    });
                                      alert.present();
                                    }else{
                                      let alert = this.alertController.create({
                                                        title: '샵을 종료하는데 실패했습니다.',
                                                        subTitle: '고객센터(0505-170-3636)에 문의바랍니다.',
                                                        buttons: ['OK']
                                                    });
                                      alert.present();
                                    }
                                });
                            }
                          }
                        ]
                    });
                    alert.present();
    }
  }


  configureGotNoti(){
    console.log("click configureGotNoti");
    if(this.storageProvider.tourMode){
          let alert = this.alertController.create({
                      title: '주문을 처리하는 담당자가 됩니다.',
                      subTitle:'둘러보기 모드에서는 동작하지 않습니다.',
                      buttons: ['OK']
                  });
          alert.present();
      return;
    }

      let body = JSON.stringify({takitId:this.storageProvider.myshop.takitId});      
       console.log("body: "+body);
      this.serverProvider.post("/shop/refreshInfo",body).then((res:any)=>{
           console.log("refreshInfo res:"+JSON.stringify(res));
          if(res.result=="success"){
             if(res.shopUserInfo.GCMNoti=="on"){
                this.notiColor="#33b9c6";
                this.storageProvider.amIGotNoti=true;
            }else{ // This should be "off"
                this.notiColor="gray";
                this.storageProvider.amIGotNoti=false;
            }
            if(res.shopInfo.business=="on"){
                this.storeColor="#33b9c6";
                this.storageProvider.storeOpen=true;
            }else{ // This should be "off"
                this.storeColor="gray";
                this.storageProvider.storeOpen=false;
            }
            this.enableGotNoti();
          }
      },(err)=>{
            if(err=="NetworkFailure"){
              let alert = this.alertController.create({
                                title: '서버와 통신에 문제가 있습니다',
                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                buttons: ['OK']
                            });
              alert.present();
            }
      });
  }

  enableGotNoti(){
    console.log("enableGotNoti"+ this.storageProvider.amIGotNoti);
    if(this.storageProvider.amIGotNoti==false){
          let confirm = this.alertController.create({
            title: '주문알림을 받으시겠습니까?',
            buttons: [
              {
                text: '아니오',
                handler: () => {
                  console.log('Disagree clicked');
                }
              },
              {
                text: '네',
                handler: () => {
                  console.log('Agree clicked');
                  this.requestManager().then(()=>{
                        this.notiColor="#33b9c6";
                        this.storageProvider.myshop.GCMNoti=="on";
                        let alert = this.alertController.create({
                          title: '주문요청이 전달됩니다',
                          buttons: ['OK']
                        });
                        alert.present();
                  },(err)=>{
                      let alert;
                      if(err=="NetworkError"){
                        alert = this.alertController.create({
                          title: '주문알림 요청에 실패했습니다.',
                          subTitle: '네트웍 연결 확인후 다시 시도해 주시기 바랍니다.',
                          buttons: ['OK']
                        });
                      }else{
                        alert = this.alertController.create({
                          title: '주문알림 요청에 실패했습니다.',
                          buttons: ['OK']
                        });
                      }
                      alert.present();
                  });
                }
              }
            ]
          });
          confirm.present();
    }
  }

  requestManager(){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("/shop/changeNotiMember-server:"+ this.storageProvider.serverAddress);
        let body= JSON.stringify({ takitId: this.storageProvider.myshop.takitId });

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/changeNotiMember",body).then((res:any)=>{   
          console.log("res:"+JSON.stringify(res));
          if(res.result=="success"){
               resolve(); 
          }else{
                reject();
          }
        },(err)=>{
                reject(err);
        });

      });
  }

      openStore(){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("openShop-server:"+ this.storageProvider.serverAddress);
        let body= JSON.stringify({takitId: this.storageProvider.myshop.takitId});

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/openShop",body).then((res:any)=>{   
            console.log("/shop/openShop"+"-res:"+JSON.stringify(res));
            if(res.result=="success"){
                resolve();
            }else
                reject();
         },(err)=>{
           console.log("서버와 통신에 문제가 있습니다");
            reject(err);
         });
      });
    }

    closeStore(){
      return new Promise((resolve,reject)=>{
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log("closeShop-server:"+ this.storageProvider.serverAddress);
        let body= JSON.stringify({takitId:this.storageProvider.myshop.takitId});

        console.log("body:"+JSON.stringify(body));
        this.serverProvider.post("/shop/closeShop",body).then((res:any)=>{   
            console.log("/shop/closeShop"+"-res:"+JSON.stringify(res));
            if(res.result=="success"){
                resolve();
            }else
                reject();
         },(err)=>{
           console.log("서버와 통신에 문제가 있습니다");
            reject(err);
         });
      });
    }

    getBusinessHoursString(){
      let string="";
      let weeks=[];
      console.log("this.weeks:"+JSON.stringify(this.weeks));
      console.log("this.weeks.length:"+this.weeks.length);
      let i=0;
      for(i=0;i<this.weeks.length;i++){
        let day=this.weeks[i];
        console.log("day:"+JSON.stringify(day));
        let starthh = day.startHour <10? "0"+ day.startHour: day.startHour;
        let startmin= day.startMin <10? "0"+ day.startMin: day.startMin;
        let endhh = day.endHour <10? "0"+ day.endHour: day.endHour;
        let endmin= day.endMin <10? "0"+ day.endMin: day.endMin;
        let string=starthh+":"+startmin+"~"+endhh+":"+endmin;
        weeks.push(string);
      }
      console.log("businessHour:"+JSON.stringify(weeks));
      return JSON.stringify(weeks);
    }

    changeBusinessHours(){
      this.getBusinessHoursString();

        let alert = this.alertController.create({
        title: '주문시간을 수정하시겠습니까?',
            buttons: [{
                text:'아니오',
                handler:()=>{
                  console.log("Disagree clicked");
                }
              },{
                text:'네',
                handler:()=>{
                  console.log("Agree clicked");
                  let businessTime=this.getBusinessHoursString();
                  let body=JSON.stringify({takitId:this.storageProvider.myshop.takitId, businessTime:businessTime});
                  this.serverProvider.post("/shop/modifyBusinessHours",body).then((res:any)=>{
                            console.log("refreshInfo res:"+JSON.stringify(res));
                            if(res.result=="success"){
                                let alertConfirm = this.alertController.create({
                                            title: '영업시간 변경에 성공했습니다. ',
                                            buttons: ['OK']
                                        });
                                alertConfirm.present();
                            }else{
                                let alertConfirm = this.alertController.create({
                                            title: '영업시간 변경에 실패했습니다. ',
                                            subTitle:'고객센터에 문의바랍니다.',
                                            buttons: ['OK']
                                        });
                                alertConfirm.present();
                            }
                  },err=>{
                      let alertConfirm = this.alertController.create({
                                  title: '영업시간 변경에 실패했습니다. ',
                                  subTitle:'네트웍상태를 확인해 주시기 바랍니다.',
                                  buttons: ['OK']
                              });
                      alertConfirm.present();
                  });
                }
              } 
              ]
        });
        alert.present();
    }
}
