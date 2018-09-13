import { Component ,NgZone} from '@angular/core';
import { NavController ,Platform} from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';

declare var chrome:any;
declare var networkinterface: any;
var gHomePage:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  ipAddress;
  queue:any=[];
  prevMessage:string="";

  constructor(public navCtrl: NavController,private platform:Platform,
              public ngZone:NgZone,private tts: TextToSpeech) {
        gHomePage=this;
        this.platform.ready().then(() => {
                networkinterface.getWiFiIPAddress((ip) => {
                    console.log(JSON.stringify(ip));
                    this.ngZone.run(()=>{
                          this.ipAddress=ip.ip;
                    });
                    let addr=ip.ip;
                    let port = 12345;
                    chrome.sockets.tcpServer.create(function(createInfo) {
                        chrome.sockets.tcpServer.listen(createInfo.socketId, addr, port, /** backlog */ function(result){
                          if (result === 0) {
                            console.log('socket is listenning');                            
                          }
                        },err=>{

                        });
                    },err=>{

                    })
                    
                });

                chrome.sockets.tcpServer.onAcceptError.addListener(function (info){
                  console.log('AcceptError on socket: ' + info.socketId);
                  console.log(info);
                  chrome.sockets.tcpServer.disconnect(info.socketId);
                  chrome.sockets.tcpServer.close(info.socketId);
                });

                chrome.sockets.tcpServer.onAccept.addListener(function (info){
                    console.log('Accepted on socket: ' + info.socketId);
                    console.log(JSON.stringify(info));

                    chrome.sockets.tcp.onReceive.addListener(function (info){
                        console.log('Server Recv: success');
                        console.log(JSON.stringify(info));
                        if (info.data) {
                            var message = decodeURI(String.fromCharCode.apply(null, new Uint8Array(info.data)));
                            console.log(message);
                            let options=JSON.parse(message);
                            console.log("indexOf:"+gHomePage.queue.indexOf(options));
                            if(gHomePage.prevMessage.length==0 || gHomePage.prevMessage!=message){
                                gHomePage.prevMessage=message;
                                gHomePage.play(options);
                                /*
                                gHomePage.tts.speak( options)
                                    .then(() => console.log('Success'))
                                    .catch((reason: any) => console.log(reason))
                                */   
                            }
                        }
                        chrome.sockets.tcp.disconnect(info.socketId);
                        chrome.sockets.tcp.close(info.socketId);
                    });

                    chrome.sockets.tcp.onReceiveError.addListener(function (info){
                        console.log('Server RecvError on socket: ' + info.socketId);
                        console.log(JSON.stringify(info));
                        chrome.sockets.tcp.disconnect(info.socketId);
                        chrome.sockets.tcp.close(info.socketId);
                    });
                    chrome.sockets.tcp.setPaused(info.clientSocketId, false);
                });
        })
  }

  checkAndPlay(){
    console.log("this.queue.length:"+this.queue.length);  
    if(this.queue.length>=1){
        this.queue.splice(0,1);
    }
    if(this.queue.length>=1){
        this.tts.speak(this.queue[0])
            .then(() => { 
                console.log('Success'); 
                this.checkAndPlay();
            })
            .catch((reason: any) => console.log(reason))
    }else
        this.prevMessage="";
  }

  play(options){
      this.queue.push(options);
      if(this.queue.length==1){
            this.tts.speak( options)
            .then(() => { 
                this.checkAndPlay();
            })
            .catch((reason: any) => console.log(reason))

      }
  }

  
}
