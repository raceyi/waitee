import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storageProvider';
import {ServerProvider} from '../../providers/serverProvider';

/**
 * Generated class for the SoldOutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sold-out',
  templateUrl: 'sold-out.html',
})
export class SoldOutPage {
  categories=[];
  menus=[];
  categorySelected=0;
  shop:any={};
  nowMenus;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public serverProvider:ServerProvider,
              public alertController:AlertController,public storageProvider:StorageProvider) {

 }

  configureShopInfo(){
    // hum=> construct this.categoryRows
    this.shop.categories.forEach(category => {
        let menus=[];
        console.log("[configureShopInfo]this.shop:"+this.shop);
        this.shop.menus.forEach(menu=>{
            //console.log("menu.no:"+menu.menuNO+" index:"+menu.menuNO.indexOf(';'));
            let no:string=menu.menuNO.substr(menu.menuNO.indexOf(';')+1);
            //console.log("category.category_no:"+category.categoryNO+" no:"+no);
            if(no==category.categoryNO){
                menu.filename=encodeURI(this.storageProvider.awsS3+menu.imagePath);
                menu.categoryNO=no;
                //console.log("menu.filename:"+menu.filename);
                let menu_name=menu.menuName.toString();
                //console.log("menu.name:"+menu_name);
                if(navigator.language.startsWith("ko") && menu_name.indexOf("(")>0){
                    //console.log("name has (");
                    menu.menuName = menu_name.substr(0,menu_name.indexOf('('));
                    //console.log("menu.name:"+menu.name);
                    menu.description = menu_name.substr(menu_name.indexOf('('));
                    menu.descriptionHide=false;
                }else{
                    menu.descriptionHide=true;
                }
                console.log("menu:"+JSON.stringify(menu));
                menus.push(menu);
            }
        });

        if(!navigator.language.startsWith("ko") && category.categoryNameEn!=undefined && category.categoryNameEn!=null){
            //console.log("!ko && hasEn");
            this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryNameEn,menus:menus});
        }else // Korean
            this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryName,menus:menus});

        console.log("[categories]:"+JSON.stringify(this.categories));
        //console.log("menus.length:"+menus.length);
    });
        //console.log("categories len:"+this.categories.length);
     
        this.categorySelected=0; // hum...
        
        console.log("categories!!!!!!!!!!!!!!!!info:"+this.categories[0].menus[0].menuName);
        this.nowMenus=this.categories[0].menus;
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }       

        for(var j=0;j<this.nowMenus.length;j++){
              this.nowMenus[j].soldOut=false;
              this.nowMenus[j].ngStyle={'background-image': 'url('+ this.storageProvider.awsS3+this.nowMenus[j].imagePath + ')'};
        }           

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SoldOutPage');
    this.serverProvider.getShopInfoAll(this.storageProvider.myshop.takitId).then((res:any)=>{
          console.log("res:"+JSON.stringify(res));
          console.log("this.shop.categories:"+JSON.stringify(res.categories));
          console.log("this.shop.categories:"+JSON.stringify(res.menus));
          this.shop.categories= res.categories;
          this.shop.menus=res.menus;
          this.configureShopInfo();
    });
  }

  configureButtonColor(i){
     if(i==this.categorySelected)
          return '#6441a5';
      else
          return '#bdbdbd';    
  }

  categoryClick(sequence){ // please use the sequence value
    console.log("[categoryChange] sequence:"+sequence+" previous:"+this.categorySelected);
    console.log("sequence type:"+typeof sequence+"categorySelected type:"+typeof this.categorySelected)
    // console.log("this.categoryMenuRows.length:"+this.categoryMenuRows.length);
    // if(this.categoryMenuRows.length>0){
        //why do need this length?
        //console.log("change menus");
        this.nowMenus=this.categories[sequence-1].menus;
        for(var j=0;j<this.nowMenus.length;j++){
              this.nowMenus[j].soldOut=false;
              this.nowMenus[j].ngStyle={'background-image': 'url('+ this.storageProvider.awsS3+this.nowMenus[j].imagePath + ')'};
        }           
        
        this.menus=[];
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }       
        this.categorySelected=sequence-1; //Please check if this code is correct.
    console.log("categorySelected:"+this.categorySelected);
  }

  selectMenu(menu){
    console.log("selectMenu");
      if(!menu.soldOut){
          let confirm = this.alertController.create({
                message: menu.menuName+'를 판매종료 하시겠습니까?',
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
                        menu.soldOut=true;
                    }}
                ]});
                confirm.present();
      }else{
          let confirm = this.alertController.create({
                message: menu.menuName+'를 판매 하시겠습니까?',
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
                        menu.soldOut=false;        
                    }}
                ]});
                confirm.present();
      }
  }

  configureMenuColor(menu){
      if(!menu.soldOut){
          return 'white';
      }else{
          return '#bdbdbd';
      }
  }
}
