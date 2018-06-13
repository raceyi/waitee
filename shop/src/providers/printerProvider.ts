import {Injectable,EventEmitter} from '@angular/core';
import {Platform,Events} from 'ionic-angular';
import {StorageProvider} from './storageProvider';
import { NativeStorage } from '@ionic-native/native-storage';

declare var cordova:any;

@Injectable()
export class PrinterProvider{
    printer;
    printerStatus;  // connected,disconnected
    printerlist=[];
    
    constructor(public storageProvider:StorageProvider,
    public events: Events,
    private platform:Platform,
    private nativeStorage: NativeStorage){
        console.log("printerProvider constructor"); 
       // this.printer=this.storageProvider.printer;

      platform.ready().then(() => {
        cordova.plugins.BtPrinter.listen((status)=>{
          console.log("status:"+status);
          this.printerStatus=status;
          this.events.publish('printer:status', this.printerStatus);
        })

        this.nativeStorage.getItem("printer").then((value:string)=>{
            console.log("getItem-printer-value:"+value);
            let printer=JSON.parse(value);
            this.storageProvider.printerName=printer.name;
            this.setPrinter(printer);
            this.nativeStorage.getItem("printOn").then((value:string)=>{
                console.log("printOn:"+value);
                this.storageProvider.printOn= JSON.parse(value);
            },()=>{
                this.storageProvider.printOn=false;
            });
        },()=>{
            this.storageProvider.printOn=false;
            console.log("getItem printer returns error");         
        });

      })
    }

    setPrinter(printer){
        console.log("setPrinter:"+JSON.stringify(printer));
        this.printer=printer;
    }

    scanPrinter(){
        return new Promise((resolve,reject)=>{
            console.log("scanPrinter");
            this.printerlist=[];
            cordova.plugins.BtPrinter.list((data)=>{
                console.log("Success "+data); //list of printer in data array
                this.printerlist=data;
                if(this.printerlist.length==1){
                    this.printer=this.printerlist[0];
                }
                console.log("printerlist:"+JSON.stringify(this.printerlist));
                resolve(this.printerlist);
            },(err)=>{
                console.log("Error");
                this.printer=undefined;
                reject(err);
                //console.log(err);
            });
        });
    }


    connectPrinter(){
         return new Promise((resolve,reject)=>{
             if(!this.printer || !this.printer.address){
                    if(!this.printer){
                        this.printer=this.printerlist[0];
                        cordova.plugins.BtPrinter.connect(this.printer.address,(result)=>{
                            console.log("result:"+JSON.stringify(result));
                        },err=>{

                        })
                    }
             }else{    
                cordova.plugins.BtPrinter.connect(this.printer.address,(result)=>{
                    console.log("result:"+JSON.stringify(result));
                },err=>{

                })
             }
       });
  }

  disconnectPrinter(){
         return new Promise((resolve,reject)=>{
            if(this.printerStatus=="connected"){
                    cordova.plugins.BtPrinter.disconnect((data)=>{
                        console.log("disconnect Success:"+data);
                        resolve();
                    },(err)=>{
                        console.log("Error:"+err);
                        reject(err);
                    })
            }
         });
  }

    print(title,message){
        console.log("print");
         return new Promise((resolve,reject)=>{
            if(this.printerStatus=="connected"){
                cordova.plugins.BtPrinter.print(title+','+message+"\n\n\n\n ************",(data)=>{
                    console.log("print Success");
                    console.log(data);
                    resolve();
                },(err)=>{
                    console.log("Error");
                    //console.log(err);
                    reject(err);
                }); // format: title, message
            }else{
                console.log("this.printer:"+this.printer);
                if(this.printer==undefined){
                    reject("printerUndefined");
                }else{
                    console.log("try to connect Printer");
                    this.connectPrinter().then(()=>{
                        // give one second
                        setTimeout(() => {
                            cordova.plugins.BtPrinter.print(title+','+message+"\n\n\n\n ************",(data)=>{
                                console.log("print Success");
                                console.log(data);
                                resolve();
                            },(err)=>{
                                console.log("print-Error!");
                                //console.log(err);
                                reject(err);
                            }); // format: title, message
                        }, 3000); // 1 second after for connectPrinter
                    },()=>{
                        console.log("connect Error");
                        reject();
                    });
                }
            }
         });
  }

}


