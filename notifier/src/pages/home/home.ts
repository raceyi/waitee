import { Component } from '@angular/core';
import { NavController ,Platform} from 'ionic-angular';
declare var chrome:any;
declare var networkinterface: any;
var gHomePage:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,private platform:Platform) {
        gHomePage=this;
        this.platform.ready().then(() => {
                networkinterface.getWiFiIPAddress((ip) => {
                    console.log(ip);
                    let addr=ip;
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
                    console.log(info);
                    //chrome.sockets.tcp.setPaused(info.clientSocketId, false, function() {
                    //  chrome.sockets.tcp.send(info.clientSocketId, arr.buffer, function(result) {
                    //    if (result.resultCode === 0) {
                    //      console.log('TCP send: success');
                    //    }
                    //  });
                    //});
                });

                chrome.sockets.tcp.onReceiveError.addListener(function (info){
                    console.log('Server RecvError on socket: ' + info.socketId);
                    console.log(info);
                    chrome.sockets.tcp.disconnect(info.socketId);
                    chrome.sockets.tcp.close(info.socketId);
                });

                chrome.sockets.tcp.onReceive.addListener(function (info){
                    console.log('Server Recv: success');
                    console.log(info);
                    chrome.sockets.tcp.disconnect(info.socketId);
                    chrome.sockets.tcp.close(info.socketId);
                });

        })
  }

  
}
