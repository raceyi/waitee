import { Component, ViewChild ,NgZone} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ModalController, ViewController } from 'ionic-angular';
import { AlertController, Content} from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
//import { File } from '@ionic-native/file';
import {ServerProvider} from '../../providers/serverProvider';
import {StorageProvider} from '../../providers/storageProvider';
import {Http,Headers} from '@angular/http';

var gMenuModalPage:any;

/**
 * Generated class for the MenuMoalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-menu-modal-page',
  templateUrl: 'menu-modal-page.html',
})
export class MenuModalPage {
@ViewChild('menuContent') menuContentRef:Content;
    //주문 시간 제약 추가 -begin
    timeConstraint;
    from;
    fromHour;
    fromMin;
    toHour;
    toMin;
    to;
    condition;
    fromHours=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    toHours=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    minutes=[0,10,20,30,40,50];
    //주문 시간 제약 추가 -end

    menu;
    flags = {"add":false, "options":true, "imageUpload":false, "hasImage":false, "segment": false};
    imageURI;
    menuSelected=1;
   
    uploadFile;
    img1:any; 
    prevChosenFile:any;

  constructor(public params:NavParams, public viewCtrl: ViewController, 
              public navCtrl: NavController, private alertController:AlertController,
              private camera: Camera, 
              //private file: File,
              private  ngZone:NgZone,
              public serverProvider:ServerProvider, public storageProvider:StorageProvider) {
      console.log("menu modal constructor:"+JSON.stringify(params.get('menu')));

      gMenuModalPage=this;
      if(params.get('menu').hasOwnProperty('menuName')){
        this.menu=params.get('menu');
        this.menu.oldMenuName = this.menu.menuName;
      }else{
         console.log("menu add modal");
        this.flags.add=true;
        this.menu=params.get('menu');
      }

       if(this.menu.imagePath === undefined || this.menu.imagePath === null){
            this.flags.hasImage = false;
       }else{
           this.flags.hasImage = true;
       }

      if(params.get('menu').hasOwnProperty('imagePath') && params.get('menu').imagePath !== null){
          console.log(this.menu.imagePath);
          this.menu.imagePath= this.menu.imagePath.substr(this.menu.imagePath.indexOf('_') + 1);
      }
      
      if(params.get('menu').hasOwnProperty('takeout') && params.get('menu').takeout === '1'){
        this.menu.takeout = true;
      }else if(params.get('menu').hasOwnProperty('takeout') && params.get('menu').takeout === '2'){
          this.menu.takeout = true;
          this.menu.delivery = true;
      }

      if(params.get('menu').hasOwnProperty('timeConstraint') && params.get('menu').timeConstraint!=undefined && params.get('menu').timeConstraint!=null){
            let timeConstraint=JSON.parse(params.get('menu').timeConstraint);
            this.timeConstraint=true;
            this.from=timeConstraint.from;
            this.to=timeConstraint.to;
            this.condition=timeConstraint.condition;
            if(timeConstraint.fromMins){
                this.fromHour=(timeConstraint.fromMins-timeConstraint.fromMins%60)/60;
                this.fromMin=timeConstraint.fromMins%60;
            }
            if(timeConstraint.toMins){
                this.toHour=(timeConstraint.toMins-timeConstraint.toMins%60)/60;
                this.toMin=timeConstraint.toMins%60;
            }
      }
      if(params.get('menu').hasOwnProperty('deactive') && params.get('menu').deactive !== null){
          if(params.get('menu').deactive==1)
            this.menu.deactive=true;
      }
      console.log("construct menu:"+JSON.stringify(this.menu));
      console.log("flags"+JSON.stringify(this.flags));
      this.storageProvider.storeType = this.storageProvider.shopInfo.storeType;      
      if(storageProvider.storeType=='restaurant'){
            if(this.isNull(this.menu.filter) /* !this.menu.filter || this.menu=='null' */){
                this.menu.filter={beef:{include:false, freeKor:undefined, freeEn:undefined},
                                    pork:{include:false, freeKor:undefined, freeEn:undefined},
                                    chicken:{include:false, freeKor:undefined, freeEn:undefined},
                                    fish:{include:false, freeKor:undefined, freeEn:undefined},
                                    egg:{include:false, freeKor:undefined, freeEn:undefined}};
            }else if(typeof this.menu.filter ==='string'){
                console.log("filter:"+this.menu.filter);
                let filter=JSON.parse(this.menu.filter);
                if(typeof filter ==='string'){
                    console.log("invalid filter type!!");
                    filter=JSON.parse(filter);
                    if(typeof filter==='string'){
                        console.log("invalid type2");
                    }
                }
                this.menu.filter=filter;
            }
      }
  }

  ionViewDidEnter(){
      //this.menuContentRef.resize(); //scroll resize
  }


  segmentChange(){
      console.log("segmentChange");
      console.log("menuSelected:"+this.menuSelected);
      if(this.menuSelected === 1){
        this.flags.segment = false;
      }else if(this.menuSelected === 2){
        this.flags.segment = true;
      }
      console.log(this.flags.segment);
  }

  takePicture(){  
   let cameraOptions = {
      quality: 100,
      targetWidth :500,
      targetHeight :500,
      saveToPhotoAlbum : true,
      allowEdit:true,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
      
    }

    this.camera.getPicture(cameraOptions).then((imageURI) => {
        this.imageURI = imageURI;
        let tmpURI = imageURI.split('/')
        this.menu.imagePath = tmpURI[tmpURI.length-1];

      //this.serverProvider.fileTransferFunc(imageURI);
    }, (err) => {
    // Handle error
        console.log("err:"+JSON.stringify(err)); 
    });
}

  pickPicture(){     
    let options = {
      quality: 100,
      targetWidth :500,
      targetHeight :500,
      allowEdit:true,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };
    this.camera.getPicture(options).then((imageURI) => {
        this.imageURI = imageURI;
        let tmpURI = imageURI.split('/')
        this.menu.imagePath = tmpURI[tmpURI.length-1];
        //this.serverProvider.fileTransferFunc(imageURI,this.menu);
       }, (err) => {
           console.log("err:"+JSON.stringify(err)); 
       });        
  }

  uploadMenuImage(){

      //set upload flag
    //console.log(this.imageURI);

    this.serverProvider.fileTransferFunc(this.uploadFile/*this.imageURI*/,this.menu).then((res:any)=>{
        console.log("uploadMenuImage:"+res);
        if(res.result === "success"){
            this.flags.imageUpload =true;
            console.log(this.flags.imageUpload);
            let alert = this.alertController.create({
                        title : "사진 업로드를 완료 하였습니다.",
                        buttons : ['확인']
                    });
            alert.present();
        }else if(res.result === "failure"){
            if(res.error === "exist same image"){
                let alert = this.alertController.create({
                    title : "다른 메뉴에서 같은 이름의 사진을 사용중입니다.",
                    subTitle : "사진 이름을 변경하세요.",
                    buttons : ['확인']
                });
                alert.present();
            }else{
                console.log(res.error);
                let alert = this.alertController.create({
                    title : "사진 업로드에 실패하였습니다.",
                    buttons : ['확인']
                });
                alert.present();
            }            
        }
        
    },err=>{
        console.log(err);
        let alert = this.alertController.create({
            title : "사진 업로드에 실패하였습니다.",
            buttons : ['확인']
        });
        alert.present();
    });
  }

  checkTimeConstraint(){
    if(this.timeConstraint){
        if(this.from && this.fromHour==undefined){
                let alert = this.alertController.create({
                            title: "from 시간을 선택해 주세요",
                            buttons: ['확인']
                        });
                alert.present();        
            return false;
        }else if(this.from && this.fromMin==undefined){
                let alert = this.alertController.create({
                            title: "from 분을 선택해 주세요",
                            buttons: ['확인']
                        });
                alert.present();        
            return false;
        }else if(this.to && this.toHour==undefined){
                let alert = this.alertController.create({
                            title: "to 시간을 선택해 주세요",
                            buttons: ['확인']
                        });
                alert.present();        
            return false;
        }else if(this.to && this.toMin==undefined){
                let alert = this.alertController.create({
                            title: "to 분을 선택해 주세요",
                            buttons: ['확인']
                        });
                alert.present();        
            return false;
        }    
        //timeConstraint:{from:true/false, to:true/false, fromMins:number, toHour:number,condition:"XOR"/"AND""}
        this.menu.timeConstraint=JSON.stringify({from:this.from,to:this.to,fromMins:this.fromHour*60+this.fromMin, toMins:this.toHour*60+this.toMin ,condition:this.condition});
        console.log("timeConstraint:"+JSON.stringify(this.menu.timeConstraint));
    }  
    return true;
  }

  modifyMenuInfo(){
    console.log("modifyMenuInfo"+this.menu);
    console.log(this.flags.imageUpload);

    //시간 제약 확인
    if(!this.checkTimeConstraint())
        return;
    //필수 정보 확인
    if(!this.isNull(this.menu.menuName) && 
        !this.isNull(this.menu.price)){
    
        if(!this.flags.hasImage && !this.flags.imageUpload){ //기존 등록된 이미지가 없다면
            let alert = this.alertController.create({
                        title: "사진을 업로드 해주세요.",
                        buttons: ['확인']
                    });
            alert.present();
        }else{
            let optionFlags = true;

            if(this.menu.options !== undefined && this.menu.options !== null){
                console.log("options not undefined");
                for(let i=0; i<this.menu.options.length; i++){
                    if(this.isNull(this.menu.options[i].name) || this.isNull(this.menu.options[i].price)){
                        // console.log("i:"+i)
                        // console.log("flags:"+optionFlags);
                        // console.log("options"+this.menu.options[i].name+ " "+this.menu.options[i].price);
                        optionFlags=false;
                        //console.log("flags:"+optionFlags);
                        break;
                    }
                    if(this.menu.options[i].choice !== undefined){
                        for(let j=0; i<this.menu.options[i].choice; j++){
                            if(this.isNull(this.menu.options[i].choice[j])){
                                // console.log("j:"+j)
                                // console.log("flags:"+optionFlags);
                                // console.log("options"+this.menu.options[i].choice[j]);

                                optionFlags=false;
                                //console.log("flags:"+optionFlags);
                                break;
                            }
                        }
                    }
                    
                }
                //console.log("after for :"+this.menu.options);
            }

            if(this.menu.optionsEn!== undefined && this.menu.optionsEn !== null){
                console.log("options not undefined");
                for(let i=0; i<this.menu.optionsEn.length; i++){
                    if(this.isNull(this.menu.optionsEn[i].name) || this.isNull(this.menu.optionsEn[i].price)){
                        console.log("i:"+i)
                        console.log("flags:"+optionFlags);
                        console.log("options"+this.menu.optionsEn[i].name+ " "+this.menu.optionsEn[i].price);
                        optionFlags=false;
                        console.log("flags:"+optionFlags);
                        break;
                    }
                    if(this.menu.optionsEn[i].choice !== undefined){
                        for(let j=0; i<this.menu.optionsEn[i].choice; j++){
                            if(this.isNull(this.menu.optionsEn[i].choice[j])){
                                console.log("j:"+j)
                                console.log("flags:"+optionFlags);
                                console.log("options"+this.menu.optionsEn[i].choice[j]);

                                optionFlags=false;
                                console.log("flags:"+optionFlags);
                                break;
                            }
                        }
                    }
                    
                }
                console.log("after for :"+this.menu.options);
            }

            console.log("flags:"+optionFlags);

            if(optionFlags === true){

                // stringify 하면 이 순간에 error!!!!!!!!! 
                // if(this.menu.options !== undefined){
                //     this.menu.options= JSON.stringify(this.menu.options);
                // }

                if(this.menu.takeout ===null || this.menu.takeout === false){
                    this.menu.takeout = 0;
                }else if(this.menu.takeout === true){
                    this.menu.takeout = 1;
                }

                if(this.menu.delivery === true){
                    this.menu.takeout = 2;
                }

                if(!this.isNull(this.menu.imagePath)){
                    this.menu.imagePath = this.storageProvider.myshop.takitId+"_"+this.menu.imagePath;
                }
                // 기존의 이미지를 사용할경우 menu.imagePath를 삭제한다.
                if(this.flags.hasImage && !this.flags.imageUpload){
                    delete this.menu.imagePath;
                    console.log("delete this.menu.imagePath");
                }
                
                // 설명필드가 reset될수도 있다.
                if(!this.menu.explanation || this.menu.explanation.trim().length==0)
                    this.menu.explanation=null;

                if(!this.menu.explanationEn || this.menu.explanationEn.trim().length==0)
                    this.menu.explanation=null;
                
                //filter 정보를 추가한다. storeType=='restaurant'이라면 영문정보를 위해
                if(this.storageProvider.storeType=='restaurant'){
                    console.log("this.menu.filter:"+JSON.stringify(this.menu.filter))
                    this.menu.filter=JSON.stringify(this.menu.filter);
                }else{
                    delete this.menu.filter;
                }

                this.serverProvider.modifyMenuInfo(this.menu)
                .then((res:any)=>{
                    if(res.result === "success"){
                        let alert = this.alertController.create({
                                        title: "메뉴가 수정 되었습니다.",
                                        subTitle: '다시 로드 하면 화면에 보여집니다.',
                                        buttons: [ {text: '확인',
                                                    handler: ()=>{
                                                        this.viewCtrl.dismiss();
                                                    }
                                                }]
                                    });
                        alert.present();
                    }else{
                        console.log("modifyMenuInfo failure:"+JSON.stringify(res.error));
                        let alert = this.alertController.create({
                                    title: "메뉴 수정에 실패 하였습니다.",
                                    subTitle: '다시 시도해주세요.',
                                    buttons: [ {text: '확인',
                                                handler: ()=>{
                                                    this.viewCtrl.dismiss();
                                                }
                                            }]
                                });
                        alert.present();
                    }
                },(err)=>{
                    console.log("modifyMenuInfo failure:"+JSON.stringify(err));
                    let alert = this.alertController.create({
                                    title: "메뉴 수정에 실패 하였습니다.",
                                    subTitle: '다시 시도해주세요.',
                                    buttons: [ {text: '확인',
                                                handler: ()=>{
                                                    this.viewCtrl.dismiss();
                                                }
                                            }]
                                });
                    alert.present();
                });
            }else{
                let alert = this.alertController.create({
                                title: "옵션을 정확히 입력해주세요.",
                                buttons: ['OK']
                            });
                alert.present();
            }
        }
    }else{
        let alert = this.alertController.create({
                                title: "메뉴 정보를 정확히 입력해주세요.",
                                subTitle: '메뉴 이름,가격은 필수입니다.',
                                buttons: ['OK']
                            });
                alert.present();
    }
    
  }

  addMenuInfo(){

    console.log(this.menu);
    console.log(this.flags.imageUpload);
    if(!this.checkTimeConstraint())
        return;
    //필수 정보 확인
    if(!this.isNull(this.menu.menuName) && 
        !this.isNull(this.menu.price)){
    
        if(!this.flags.imageUpload){
        // if(!this.isNull(this.menu.imagePath) && !this.flags.imageUpload){
            let alert = this.alertController.create({
                        title: "사진을 업로드 해주세요.",
                        buttons: ['확인']
                    });
            alert.present();
        }else{
            let optionFlags = true;

            if(this.menu.options !== undefined){
                console.log("options not undefined");
                for(let i=0; i<this.menu.options.length; i++){
                    if(this.isNull(this.menu.options[i].name) || this.isNull(this.menu.options[i].price)){
                        console.log("options"+this.menu.options[i].name+ " "+this.menu.options[i].price);
                        optionFlags=false;
                        console.log("flags:"+optionFlags);
                        break;
                    }
                    if(this.menu.options[i].choice !== undefined){
                        for(let j=0; i<this.menu.options[i].choice; j++){
                            if(this.isNull(this.menu.options[i].choice[j])){
                                console.log("options"+this.menu.options[i].choice[j]);

                                optionFlags=false;
                                console.log("flags:"+optionFlags);
                                break;
                            }
                        }
                    }
                    
                }
                console.log("after for :"+this.menu.options);
            }

            if(this.menu.optionsEn !== undefined){
                console.log("optionsEn not undefined");
                for(let i=0; i<this.menu.optionsEn.length; i++){
                    if(this.isNull(this.menu.optionsEn[i].name) || this.isNull(this.menu.optionsEn[i].price)){
                        console.log("options"+this.menu.optionsEn[i].name+ " "+this.menu.optionsEn[i].price);
                        optionFlags=false;
                        console.log("flags:"+optionFlags);
                        break;
                    }
                    if(this.menu.optionsEn[i].choice !== undefined){
                        for(let j=0; i<this.menu.optionsEn[i].choice; j++){
                            if(this.isNull(this.menu.optionsEn[i].choice[j])){
                                console.log("options"+this.menu.optionsEn[i].choice[j]);

                                optionFlags=false;
                                console.log("flags:"+optionFlags);
                                break;
                            }
                        }
                    }
                    
                }
                console.log("after for :"+this.menu.optionsEn);
            }

            console.log("flags:"+optionFlags);

            if(optionFlags === true){

                // stringify 하면 이 순간에 error!!!!!!!!! 
                // if(this.menu.options !== undefined){
                //     this.menu.options= JSON.stringify(this.menu.options);
                // }
                
                if(this.menu.takeout ===null || this.menu.takeout === false){
                    this.menu.takeout = 0;
                }else if(this.menu.takeout === true){
                    this.menu.takeout = 1;
                }

                if(this.menu.delivery === true){
                    this.menu.takeout = 2;
                }

                if(!this.isNull(this.menu.imagePath)){
                    this.menu.imagePath = this.storageProvider.myshop.takitId+"_"+this.menu.imagePath;
                }

                //filter 정보를 추가한다. storeType=='restaurant'이라면 영문정보를 위해
                if(this.storageProvider.storeType=='restaurant'){
                    console.log("this.menu.filter:"+JSON.stringify(this.menu.filter))
                    this.menu.filter=JSON.stringify(this.menu.filter);
                }else{
                    delete this.menu.filter;
                }

                this.serverProvider.addMenuInfo(this.menu)
                .then((res:any)=>{
                    if(res.result === "success"){
                        let alert = this.alertController.create({
                                        title: "메뉴가 추가 되었습니다.",
                                        subTitle: '화면을 새로고침 해주세요',
                                        buttons: [ {text: '확인',
                                                    handler: ()=>{
                                                        this.viewCtrl.dismiss();
                                                    }
                                                }]
                                    });
                        alert.present();
                    }else{
                        console.log("addMenuInfo failure:"+JSON.stringify(res.error));
                        let alert = this.alertController.create({
                                    title: "메뉴 추가에 실패 하였습니다.",
                                    buttons: [ {text: '확인',
                                                    handler: ()=>{
                                                        this.viewCtrl.dismiss();
                                                    }
                                                }]
                                });
                        alert.present();
                    }
                },(err)=>{
                    console.log("addMenuInfo failure:"+JSON.stringify(err));
                    let alert = this.alertController.create({
                                    title: "메뉴 추가에 실패 하였습니다.",
                                    buttons: [ {text: '확인',
                                                    handler: ()=>{
                                                        this.viewCtrl.dismiss();
                                                    }
                                                }]
                                });
                    alert.present();
                    
                });
            }else{
                let alert = this.alertController.create({
                                title: "옵션을 정확히 입력해주세요.",
                                buttons: ['확인']
                            });
                alert.present();
            }
        }
    }else{
        this.showAlert({title:"메뉴 정보를 정확히 입력해주세요.",
                        subTitle:"이름,가격은 필수입니다.",
                        buttons : ["확인"]});
    }
  }


  isNull(data){
    if(data === null || data === undefined || data === ""){
        return true;
    }else{
        return false;
    }
  }

  deliveryClick(){
      this.menu.takeout = true;
  }

  addOption(){
     //this.flags.options = false;
     //console.log(option.choice);
     //console.log("addOption menu:"+JSON.stringify(this.menu));
     
     if(this.menu.options === undefined || this.menu.options === null){
         this.menu.options = [];
     }

     this.menu.options.push({"name":null,"price":null});
     //this.menu.options.push({"name":"","price":"","choice":[]});
     //this.menu.optionsEn.push({"name":"","price":"","choice":[]});

    //  console.log(this.menu.options.length-1);
    // // this.menu.options[this.menu.options.length-1].choice=this.choice;
    //  console.log(this.menu.options[0].choice);
    //  let selectCount = 4;
    //  for(let i=0; i<selectCount; i++){
    //     console.log(i);
    //     //console.log(typeof this.menu.options.choice);
    //     this.menu.options[this.menu.options.length-1].choice.push(null);
    //    // this.menu.optionsEn[this.menu.options.length-1].choice.push(null);
    //  }
     console.log("options type"+ typeof this.menu.options);
     console.log(JSON.stringify(this.menu.options));
     console.log(this.menu);
     this.menuContentRef.resize();
  }

  addOptionEn(){
     //this.flags.options = false;
     //console.log(option.choice);
     //console.log("addOption menu:"+JSON.stringify(this.menu));
     
     if(this.menu.optionsEn === undefined || this.menu.optionsEn === null){
         this.menu.optionsEn = [];
     }

     this.menu.optionsEn.push({"name":null,"price":null});
     //this.menu.options.push({"name":"","price":"","choice":[]});
     //this.menu.optionsEn.push({"name":"","price":"","choice":[]});

    //  console.log(this.menu.options.length-1);
    // // this.menu.options[this.menu.options.length-1].choice=this.choice;
    //  console.log(this.menu.options[0].choice);
    //  let selectCount = 4;
    //  for(let i=0; i<selectCount; i++){
    //     console.log(i);
    //     //console.log(typeof this.menu.options.choice);
    //     this.menu.options[this.menu.options.length-1].choice.push(null);
    //    // this.menu.optionsEn[this.menu.options.length-1].choice.push(null);
    //  }
     console.log("options type"+ typeof this.menu.optionsEn);
     console.log(JSON.stringify(this.menu.optionsEn));
     console.log(this.menu);
     this.menuContentRef.resize();
  }

  removeOption(optionIdx){
      console.log(optionIdx);
    if(this.menu.options.length===1){
        delete this.menu.options;
        this.menu.options=null;
    }else{
        for(let i=optionIdx; i<this.menu.options.length-1; i++){
            this.menu.options[i]=this.menu.options[i+1];          
        }

      //last option pop
      this.menu.options.pop();
    //delete this.menu.options[i];
    }
    this.menuContentRef.resize();
  }

  removeOptionEn(optionIdx){
    if(this.menu.optionsEn.length===1){
        delete this.menu.optionsEn;
    }else{   
        for(let i=optionIdx; i<this.menu.optionsEn.length-1; i++){
            this.menu.optionsEn[i]=this.menu.optionsEn[i+1];          
        }
        //last option pop
        this.menu.optionsEn.pop();
    }
    //delete this.menu.optionsEn[i];
    this.menuContentRef.resize();
  }


  addSelectMenu(optionIdx){
    //   console.log(choiceIdx);
    //   if(choiceIdx<4){
    //       if(this.menu.options[optionIdx].choice === undefined){
    //         this.menu.options[optionIdx].choice =[];
    //       }

    //       this.menu.options[optionIdx].choice.push("");
    //   }else{
    
    //first add
    


    if(this.menu.options[optionIdx].choice === undefined){
        this.menu.options[optionIdx].choice =[];
        this.menu.options[optionIdx].choice.push(null);
    }else{
        if(this.menu.options[optionIdx].choice.length === 6){
            let alert = this.alertController.create({
                        title: "선택항목은 6개까지만 추가 가능합니다.",
                        buttons: ['확인']
                });
            alert.present();
        }else{
            this.menu.options[optionIdx].choice.push(null);
        }
    }
    this.menuContentRef.resize();
  }

  addSelectMenuEn(optionEn){
    if(optionEn.choice === undefined){
        optionEn.choice =[];
        optionEn.choice.push(null);
    }else{
        if(optionEn.choice.length === 6){
            let alert = this.alertController.create({
                        title: "선택항목은 6개까지만 추가 가능합니다.",
                        buttons: ['확인']
                });
            alert.present();
        }else{
            optionEn.choice.push(null);
        }
    }
    this.menuContentRef.resize();
  }

  removeSelectMenu(optionIdx,choiceIdx){
    //선택항목이 하나일 경우 choice 완전히 삭제
    console.log("optionIdx"+optionIdx);
    console.log("choiceIdx"+choiceIdx);
    console.log("choice"+this.menu.options[optionIdx].choice[choiceIdx]);
    console.log("option:"+this.menu.options[optionIdx]);

    if(this.menu.options[optionIdx].choice.length===1){
        delete this.menu.options[optionIdx].choice;   
    }else{    
        for(let i=choiceIdx; i<this.menu.options[optionIdx].choice.length-1; i++){
          this.menu.options[optionIdx].choice[i]=this.menu.options[optionIdx].choice[i+1];          
        }

        //last option pop
        this.menu.options[optionIdx].choice.pop();
    }
    // this.menu.options[optionIdx].choice[choiceIdx];
    this.menuContentRef.resize();

  }

  removeSelectMenuEn(optionEn, choiceIdx){
    //선택항목이 하나일 경우 choice 완전히 삭제
    console.log("optionIdx"+optionEn);
    //console.log("choiceIdx"+choiceIdx);
    console.log("choice"+optionEn.choice[choiceIdx]);

    if(optionEn.choice.length===1){
        delete optionEn.choice;   
    }else{    
        for(let i=choiceIdx; i<optionEn.choice.length-1; i++){
          optionEn.choice[i]=optionEn.choice[i+1];          
        }
        //last option pop
        optionEn.choice.pop();
    }
    // this.menu.options[optionIdx].choice[choiceIdx];
    this.menuContentRef.resize();
  }


  cancell(){
    console.log("cancell clicked");
    let alert = this.alertController.create({
                    title: "메뉴 추가를 취소 하시겠습니까?",
                    buttons: [{ text: '아니오',
                                handler: () => {
                                    console.log("cancell is cancell")
                                }
                            },
                            {   text: '예',
                                handler: () => {
                                    this.viewCtrl.dismiss();
                                }
                            }]
    });
    alert.present();
  }

  close(){
        //this.viewCtrl.dismiss(data);  //root 화면으로 돌아감
        this.viewCtrl.dismiss();
  }

  showAlert(contents){
    let alert = this.alertController.create({
                        title: contents.title,
                        subTitle: contents.subTitle,
                        buttons: contents.buttons
                    });
        alert.present();
  }


  updateFlag(option){
       if(option.extendedOptionExist){
           option.extendedOption={}
       }else{
           delete option.extendedOption;
       } 
  }

// https://deliciousbrains.com/using-javascript-file-api-to-avoid-file-upload-limits/

fileChange(event){
    if(this.prevChosenFile && this.prevChosenFile==event.target.files[0]) // why fileChange comes twice?
        return;
    this.prevChosenFile=event.target.files[0];

    if(event.target.files && event.target.files[0]){
      let reader = new FileReader();

      let fileList: FileList = event.target.files;  
      let file: File = fileList[0];
      console.log(file);

    reader.onloadend = (event:any) => {
      const formData = new FormData();
      console.log("file.name:"+file.name);
      formData.append('file', file, file.name);
      let currTime= new Date();
      let filename= currTime.getTime();//this.storageProvider.myshop.takitId+"_"+currTime.getTime(); //hum... Is it correct?
      formData.append('fileName', this.storageProvider.myshop.takitId+"_"+filename) ; 
      formData.append('takitId', this.storageProvider.myshop.takitId) ;
      formData.append('menuNO', this.menu.menuNO) ;
      formData.append('menuName', this.menu.menuName) ;

       gMenuModalPage.ngZone.run(()=>{
            gMenuModalPage.img1 = event.target.result;
             // 우선 작은 크기의 파일만 전송한다고 하자. 
             //파일의 크기가 너무 클경우 자동으로 resize해서 올리자!
            // 대용량 파일의 경우 https://deliciousbrains.com/using-javascript-file-api-to-avoid-file-upload-limits/ 참조하기
            //console.log("event.target.result:"+ event.target.result);
        });

            let url;
            let request='/shop/uploadMenuImageWeb';
            //let request='/ocrFileSubmit';
            if(this.storageProvider.device){
                url=this.storageProvider.serverAddress+request;
            }else
                url= "http://localhost:8100"+ request;
            console.log("url:"+url);
            let headers = new Headers();
            //headers.append('Content-Type', 'multipart/form-data');
            //headers.append('Accept', 'application/json');

           // var options = { content: formData };

            this.serverProvider.http.post(url,formData).timeout(120000 /* 2 minutes */).subscribe((response:any)=>{
                    let res=response.json();
                    console.log("uploadMenuImageWeb:"+JSON.stringify(res));
                    
                    if(res.result === "success"){
                        this.flags.imageUpload =true;
                        this.menu.imagePath=filename;
                        console.log(this.flags.imageUpload);
                        let alert = this.alertController.create({
                                    title : "사진 업로드를 완료 하였습니다.",
                                    buttons : ['확인']
                                });
                        alert.present();
                    }else if(res.result === "failure"){
                        if(res.error === "exist same image"){
                            let alert = this.alertController.create({
                                title : "다른 메뉴에서 같은 이름의 사진을 사용중입니다.",
                                subTitle : "사진 이름을 변경하세요.",
                                buttons : ['확인']
                            });
                            alert.present();
                        }else{
                            console.log(res.error);
                            let alert = this.alertController.create({
                                title : "사진 업로드에 실패하였습니다.",
                                buttons : ['확인']
                            });
                            alert.present();
                        }            
                    }
            },(err)=>{
                console.log("post-err:"+JSON.stringify(err));
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                            let alert = this.alertController.create({
                                title : "로그인이 필요합니다.",
                                buttons : ['확인']
                            });
                            alert.present();
                }else{
                            let alert = this.alertController.create({
                                title : "사진 업로드에 실패하였습니다.",
                                buttons : ['확인']
                            });
                            alert.present();
                }
            });
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
