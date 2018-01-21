import {Injectable,EventEmitter} from '@angular/core';
import {Platform,Events} from 'ionic-angular';
import {StorageProvider} from './storageProvider';

declare var BTPrinter:any;

@Injectable()
export class PrinterProvider{
    printer:string;
    printerStatus;  // connected,disconnected
    printerlist=[];
    
    constructor(public storageProvider:StorageProvider,public events: Events){
        console.log("printerProvider constructor"); 
        this.printer=this.storageProvider.printer;
    }

    setPrinter(printer){
        this.printer=printer;
    }

    scanPrinter(){
        return new Promise((resolve,reject)=>{
            console.log("scanPrinter");
            this.printerlist=[];
            BTPrinter.list((data)=>{
                console.log("Success");
                console.log(data); //list of printer in data array
                
                var printers=JSON.parse(data); 
                for(var i=0;i<printers.length;i++){
                    console.log("printer("+i+") "+ printers[i]+"\n");
                    var printer=JSON.parse(printers[i]);
                    this.printerlist.push(printer.name);
                }
                if(this.printerlist.length==1){
                    this.printer=this.printerlist[0];
                }
                console.log("printerlist:"+JSON.stringify(this.printerlist));
                resolve(this.printerlist);
            },(err)=>{
                console.log("Error");
                this.printer=undefined;
                this.printerStatus=undefined;
                reject(err);
                //console.log(err);
            });
        });
    }


    connectPrinter(){
         return new Promise((resolve,reject)=>{
             if(this.printerlist.length==0){ // have to call scanPrinter
                 this.scanPrinter().then(()=>{
                    BTPrinter.connect((data)=>{
                        console.log("[connectPrinter] Connect Status:"+data);
                        this.printerStatus=data;
                        this.events.publish('printer:status', this.printerStatus);
                        resolve(this.printerStatus);
                    },(err)=>{
                        console.log("fail to connect");
                        this.printerStatus=undefined;
                        reject(err);
                    },this.printer);
                 },(err)=>{
                     reject(err);
                 });
             }else{
                    console.log("[connectPrinter] this.printerStatus:"+this.printerStatus + " printer:"+this.printer); 
                    if(this.printerStatus!="connected"){
                            BTPrinter.connect((data)=>{
                                console.log("Connect Status:"+data);
                                this.printerStatus=data;
                                this.events.publish('printer:status', this.printerStatus);
                                resolve(this.printerStatus);
                            },(err)=>{
                                console.log("fail to connect");
                                this.printerStatus=undefined;
                                reject(err);
                            },this.printer);
                    }
         }
       });
  }

  disconnectPrinter(){
         return new Promise((resolve,reject)=>{
            if(this.printerStatus=="connected"){
                    BTPrinter.disconnect((data)=>{
                        console.log("disconnect Success:"+data);
                        console.log(data);
                        this.printerStatus="disconnected";
                        this.events.publish('printer:status', this.printerStatus);
                        resolve(this.printerStatus);
                    },(err)=>{
                        console.log("Error:"+err);
                        this.printerStatus=undefined;
                        reject(err);
                    })
            }
         });
  }

    print(title,message){
        console.log("print");
         return new Promise((resolve,reject)=>{
            if(this.printerStatus=="connected"){
                BTPrinter.printText((data)=>{
                    console.log("print Success");
                    console.log(data);
                    resolve();
                },(err)=>{
                    console.log("Error");
                    //console.log(err);
                    reject(err);
                }, title+','+message+"\n\n\n\n ************"); // format: title, message
            }else{
                console.log("this.printer:"+this.printer);
                if(this.printer==undefined){
                    reject("printerUndefined");
                }else{
                    console.log("try to connect Printer");
                    this.connectPrinter().then(()=>{
                        // give one second
                        setTimeout(() => {
                            BTPrinter.printText((data)=>{
                                console.log("print Success");
                                console.log(data);
                                resolve();
                            },(err)=>{
                                console.log("print-Error!");
                                //console.log(err);
                                reject(err);
                            }, title+','+message+"\n\n\n\n ************"); // format: title, message
                        }, 1000); // 1 second after for connectPrinter
                    },()=>{
                        console.log("connect Error");
                        reject();
                    });
                }
            }
         });
  }

}


