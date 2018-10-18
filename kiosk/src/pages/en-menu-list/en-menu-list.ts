import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Content ,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import { CartProvider } from '../../providers/cart/cart';
import {ServerProvider} from '../../providers/server/server';
import {EnMenuPage} from '../en-menu/en-menu';
import {EnSearchPage} from '../en-search/en-search';
import {EnOrderListPage} from '../en-order-list/en-order-list';
import {EnOrderCheckPage} from '../en-order-check/en-order-check';

/**
 * Generated class for the EnMenuListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-en-menu-list',
  templateUrl: 'en-menu-list.html',
})
export class EnMenuListPage {
  shop:any=[];
  categories:any=[];
  menus;
  categorySelected;
  nowMenus;
  @ViewChild("menuList") public contentRef: Content;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public cartProvider:CartProvider,
              private alertCtrl:AlertController,              
              public serverProvider:ServerProvider,              
              public storageProvider:StorageProvider) {
      //english버전으로 다시 계산한다.

      this.getShopInfoAll(storageProvider.takitId).then(()=>{
            this.categorySelected=0;
            //console.log("categories:"+JSON.stringify(this.categories));

            this.nowMenus=this.categories[this.categorySelected].menus;
           // this.nowMenus.forEach(menu=>{
           //       console.log("menu.menuSeq:"+menu.menuSeq);
           // })
           // console.log("menuSeq:"+this.nowMenus[0].menuSeq);

            this.sortNowMenus();

            //for(var j=0;j<this.nowMenus.length;j++)
            //      console.log("i:"+j+" "+this.nowMenus[j].menuName+ " "+this.nowMenus[j].menuSeq);

            //console.log("this.nowMenus:"+JSON.stringify(this.nowMenus));
            this.menus=[];
              for(var i=0;i<this.nowMenus.length/2;i++){
                let pair=[];
                pair.push(this.nowMenus[i*2]);
                pair.push(this.nowMenus[i*2+1]);
                this.menus.push(pair);
                console.log("i:"+i);
              }     
            //console.log("menus:"+JSON.stringify(this.menus));
            //this.menus[0][0].soldout=1; Just for testing
      },err=>{

      });
  }


getShopInfoAll(takitId){
        return new Promise((resolve,reject)=>{
            let url="/cafe/shopHome";
            let body={takitId:takitId};
            console.log("getShopInfoAll:"+JSON.stringify(body));
            this.serverProvider.post(url,body).then((res:any)=>{   
                  console.log("response"+JSON.stringify(res));  
                  if(res.result=="success"){
                      this.shop=res;
                      this.configureShopInfo();
                      //this.storageProvider.shop=this.shop;
                      //this.storageProvider.categories=this.categories;
                      // this.storageProvider.takitId=takitId;
                      // console.log("this.storageProvider.shop.businessNumber:"+this.storageProvider.shop.businessNumber);
                       resolve();
                  }else{
                    let alert = this.alertCtrl.create({
                        title: "상점 정보를 가져오는데 실패했습니다.",
                        buttons: ['OK']
                    });
                    alert.present();
                    reject();
                  } 
            },(err)=>{
                 console.log("post error "+JSON.stringify(err));
                 reject();
             });
        });
    }

 checkFilter(menu){
      if(!menu.filter ||menu.filter==null){
        return {filter:false,options:[]};
      }
      let filter=JSON.parse(menu.filter);
      if(typeof filter ==='string'){    //왜 이런 오류가 발생하는가? ㅜㅜ
            filter=JSON.parse(filter);
      }
      let output:any={filter:false,options:[]};
      let result=false;
      //console.log("storageProvider.filter:"+this.storageProvider.filter);
      for(var key in this.storageProvider.filter) {
          //console.log(this.storageProvider.filter[key]);
          if( this.storageProvider.filter[key]){ // 제외되는 재료임.
                for(var menuFilterKey in filter){
                  //console.log("key:"+key+" menuFilterKey:"+menuFilterKey);
                    if(filter[menuFilterKey].include && menuFilterKey==key){
                        if(!filter[menuFilterKey].freeEn || !filter[menuFilterKey].freeKor){
                            output.filter=true;
                        }else{
                            output.options.push({freeEn:filter[menuFilterKey].freeEn, freeKor:filter[menuFilterKey].freeKor});
                        }
                    }
                }
          }
      }
      return output;
 }

 checkFilterOption(option){
     //console.log("option:"+JSON.stringify(option));

     for(var key in this.storageProvider.filter) {
         //console.log(" key:"+key+ this.storageProvider.filter[key]+ " "+option.hasOwnProperty(key)+" "+option[key]+ " "+option.pork);
        if(this.storageProvider.filter[key] && option.hasOwnProperty(key) && option[key]){
                return true;
        }
     }
      return false;
 }

  configureShopInfo(){
    // hum=> construct this.categoryRows
    this.shop.shopInfo.imagePath=this.storageProvider.awsS3+this.shop.shopInfo.imagePath;
    //console.log("shop image: "+this.shop.shopInfo.imagePath);
    this.shop.categories.forEach(category => {
        let menus=[];
        //console.log("[configureShopInfo]this.shop:"+this.shop);
        this.shop.menus.forEach(menu=>{
            //console.log("menu.no:"+menu.menuNO+" index:"+menu.menuNO.indexOf(';'));
                let no:string=menu.menuNO.substr(menu.menuNO.indexOf(';')+1);
                //console.log("category.category_no:"+category.categoryNO+" no:"+no);
                if(no==category.categoryNO){
                    menu.filterOptions=[];
                    let filter=this.checkFilter(menu);
                    if(!filter.filter){
                        menu.filename=encodeURI(this.storageProvider.awsS3+menu.imagePath);
                        menu.categoryNO=no;
                        //console.log("menu.filename:"+menu.filename);
                        //menu.ngStyle={'background-image': 'url('+ menu.filename + ')'};
                        let menu_name;
                        if(!menu.menuNameEn || menu.menuNameEn==null ){
                            menu_name=menu.menuName.toString();
                            console.log("Please add menuEn for "+menu_name);
                        }else{
                            menu_name=menu.menuNameEn.toString();
                        }
                        //console.log("menu:"+JSON.stringify(menu));
                        if(filter.options.length>0){
                            menu.filterOptions=filter.options;
                            // humm flag option으로 처리 하여 항상 선택되도록 해야 한다.
                        }
                        if(menu.optionsEn!=null){
                            console.log("!!!menu.optionEn:"+menu.optionsEn);
                            if(typeof menu.optionsEn==='string'){
                                menu.optionsEn=JSON.parse(menu.optionsEn);
                                if(typeof menu.optionsEn==='string'){// 혹시나 보안코드로 넣었다.
                                     menu.optionsEn=JSON.parse(menu.optionsEn);
                                }
                            }
                            menu.validOptions=[];
                            menu.optionsEn.forEach(option=>{
                                if(!this.checkFilterOption(option))
                                    menu.validOptions.push(option);
                            })
                            //console.log("menu.validOptions:"+JSON.stringify(menu.validOptions));
                        }else{
                            menu.validOptions=[];
                        }
                        menus.push(menu);
                    }
                }
        });
        //console.log("menus:"+JSON.stringify(menus));
        //if(!navigator.language.startsWith("ko") && category.categoryNameEn!=undefined && category.categoryNameEn!=null){
            //console.log("!ko && hasEn");
            if(menus.length>0)
                this.categories.push({sequence:parseInt(category.sequence),categoryNO:parseInt(category.categoryNO),categoryName:category.categoryNameEn,menus:menus});
        //}
        //console.log("[categories]:"+JSON.stringify(this.categories));    
    })
     
  //    console.log("[bestMenus]:"+JSON.stringify(this.shop.shopInfo.bestMenus));       
  /*
      if(this.shop.shopInfo.bestMenus!=null){
              this.shop.bestMenus=JSON.parse(this.shop.shopInfo.bestMenus); 
              let bestMenus=[];
              this.shop.bestMenus.forEach(menu=>{
                  var found = this.shop.menus.find(function(element) {
                                return (element.menuNO == menu.menuNO && element.menuName== menu.menuName);
                              });
                  bestMenus.push(found);            
              })
              this.shop.bestMenus=bestMenus;
      }
      console.log("[bestMenus]:"+JSON.stringify(this.shop.bestMenus));       
   */   
  }


  sortNowMenus(){ //Why it doesn't work?
    this.nowMenus.sort(function(a,b){ // -1,0,1
      if(a.menuSeq!=null && b.menuSeq!=null){
            return (parseInt(a.menuSeq)-parseInt(b.menuSeq));
      }else if(a.menuSeq==null && b.menuSeq==null){
            return (a.menuName > b.menuName);
      }else if(a.menuSeq==null){
            return 1;
      }else 
            return -1;
    })     
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuListPage');
  }

  ionViewWillEnter(){
      console.log('ionViewWillEnter MenuListPage');
      this.contentRef.resize();
      this.contentRef.scrollToTop();
      console.log(this.contentRef._cTop);
      console.log(this.contentRef._fullscreen);
      console.log(this.contentRef._pLeft);
      console.log(this.contentRef._pTop);
      console.log(this.contentRef.contentTop);
  }

categoryClick(sequence){
    console.log("[categoryChange] sequence:"+sequence+" previous:"+this.categorySelected);
    console.log("sequence type:"+typeof sequence+"categorySelected type:"+typeof this.categorySelected)
        this.nowMenus=this.categories[sequence].menus;
        this.sortNowMenus();
        this.menus=[];
        for(var i=0;i<this.nowMenus.length/2;i++){
           let pair=[];
           pair.push(this.nowMenus[i*2]);
           pair.push(this.nowMenus[i*2+1]);
           this.menus.push(pair);
           console.log("i:"+i);
        }       
        this.categorySelected=sequence; 
    console.log("categorySelected:"+this.categorySelected);
  }

  configureButtonColor(i){
     if(i==this.categorySelected)
          return '#FF5F3A';
      else
          return '#000000';    
  }

  configureButtonBackgroundColor(i){
   if(i==this.categorySelected)
          return '#f4f4f4';
      else
          return '#ffffff';    
  }

  back(){
    this.navCtrl.pop();
  }

  search(){
    this.navCtrl.push(EnSearchPage,{categories:this.categories,class:"enSearchPage"});
  }

  selectMenu(menu){
    console.log("selectMenu");
    this.navCtrl.push(EnMenuPage,{menu:menu,class:"enMenuPage"});
  }

   moveOrderList(){
    this.navCtrl.push(EnOrderListPage,{class:"enOrderListPage"});
  }

 split1(string:string){
      let substrs=string.split(" ");
      let sum=0,i=0;
      for(i=0;i<substrs.length;i++){
          sum+=substrs[i].length;
          if(sum>12)
             break;
      }
      let lines="";
      if(i==0){ // 스페이스 상관없이 두라인으로 표기함
           //lines=string.substr(0,12)+"<br>"+string.substr(12);
          lines=string.substr(0,12)+string.substr(12);           
      }else{
          let j=0;
          for(j=0;j<i;j++)
              lines+=substrs[j]+" ";
      }
      return lines;
  }

  split2(string:string){
      let substrs=string.split(" ");
      let sum=0,i=0;
      for(i=0;i<substrs.length;i++){
          sum+=substrs[i].length;
          if(sum>12)
             break;
      }
      let lines="";
      if(i==0){ // 스페이스 상관없이 두라인으로 표기함
           lines=string.substr(12);
      }else{
          for(let j=i;j<substrs.length;j++)
              lines+=substrs[j];
      }
      return lines;
  }

    resetCart(){
    this.cartProvider.resetCart().then(()=>{
        this.contentRef.resize();
    });
  }

  orderCheck(){
        this.navCtrl.push(EnOrderCheckPage);
  }
}
