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

  categoryLevel=false;
  storeSelected:number=0;
  nowStore:any={};
  stores:any=[];

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
     
        if(this.categoryLevel){ //store 구조체를 만든다.
                        this.categories.forEach(category=>{
                   let substrs=category.categoryName.split("@");
                   let substrsEn,categoryNameEn; 
                   if(category.categoryNameEn!=null){
                       substrsEn=category.categoryNameEn.split("@");
                       if(category.categoryNameEn.includes('@')){
                          category.categoryNameEn=substrsEn[0].trim();
                       }
                   }
                   if(substrs.length>=2){
                        let substrs2= substrs[1].split(';');
                        let sequence,name,nameEn;
                        if(substrs2.length>=2){
                            sequence=parseInt(substrs2[1]);
                            name=substrs2[0].trim();
                        }else{
                            name=substrs[1].trim();
                        }
                        if(substrsEn && substrsEn.length>=2){ // 영어 category에는 sequence는 없다. categoryName@storeName 
                            nameEn=substrsEn[1].trim();
                        }else if(substrsEn && substrsEn.length==1){ //store name만 있을 경우 @storeName. 맞는지 확인하자.
                            nameEn=substrsEn[0].trim();
                        }
                        let index=this.stores.findIndex(function(element){
                            //console.log("compare store name: "+ name+" "+element.name.trim());
                            return (name==element.name.trim());
                        })
                        category.categoryName=substrs[0].trim();

                        if(index<0){
                            this.stores.push({name:name,nameEn:nameEn,sequence:sequence,categories:[category]});
                        }else{
                            this.stores[index].categories.push(category); 
                        }
                   }
            });
            if(this.stores.length>0){
                this.nowStore=Object.assign({}, this.stores[this.storeSelected]); 
            }
            if(this.nowStore.categories)
                this.categories=this.nowStore.categories;
        }
        this.categorySelected=0; // hum...        
        console.log("categories!!!!!!!!!!!!!!!!info:"+this.categories[0].menus[0].menuName);
        this.nowMenus=this.categories[0].menus;

        for(var j=0;j<this.nowMenus.length;j++){
              this.nowMenus[j].ngStyle={'background-image': 'url('+ this.storageProvider.awsS3+this.nowMenus[j].imagePath + ')'};
        }           

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SoldOutPage');
    this.serverProvider.getShopInfoAll(this.storageProvider.myshop.takitId).then((res:any)=>{
          console.log("res:"+JSON.stringify(res));
          console.log("SoldOutPage-shop.categories:"+JSON.stringify(res.categories));
          console.log("SoldOutPage-shop.menus:"+JSON.stringify(res.menus));
          this.shop.categories= res.categories;
          this.shop.menus=res.menus;
          this.categoryLevel=(res.shopInfo.categoryLevel=='1')? true : false;
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
    this.nowMenus=this.categories[sequence-1].menus;
    for(var j=0;j<this.nowMenus.length;j++){
            this.nowMenus[j].ngStyle={'background-image': 'url('+ this.storageProvider.awsS3+this.nowMenus[j].imagePath + ')'};
    }           
    this.categorySelected=sequence-1; //Please check if this code is correct.
    console.log("categorySelected:"+this.categorySelected);
  }

  selectMenu(menu){
    console.log("selectMenu");
      if(menu.soldout==0){
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
                        let body = JSON.stringify({menuNO:menu.menuNO,menuName:menu.menuName,soldout:true});
                        this.serverProvider.post("/configureSoldOut",body).then((res:any)=>{
                                menu.soldout=true;
                            let alert = this.alertController.create({
                                                title: menu.menuName+'이 판매종료 되었습니다',
                                                buttons: ['OK']
                                            });
                            alert.present();
                                
                        },(err)=>{
                            let alert = this.alertController.create({
                                                title: '판매종료 설정에 실패했습니다.',
                                                subTitle: '네트웍 상태를 확인하시고 다시 시도해주시기 바랍니다.',
                                                buttons: ['OK']
                                            });
                            alert.present();

                        });
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
                        let body = JSON.stringify({menuNO:menu.menuNO,menuName:menu.menuName,soldout:false});
                        this.serverProvider.post("/configureSoldOut",body).then((res:any)=>{
                                menu.soldout=false;
                        },(err)=>{
                            let alert = this.alertController.create({
                                                title: '판매 설정에 실패했습니다.',
                                                subTitle: '네트웍 상태를 확인하시고 다시 시도해주시기 바랍니다.',
                                                buttons: ['OK']
                                            });
                            alert.present();
                        });
                    }}
                ]});
                confirm.present();
      }
  }

  allSoldOut(category){
      for(let i=0;i<category.menus.length;i++){
            if(category.menus[i].soldout=='0')
                return false;
      }
      return true;
  }

  allSoldOutStore(index){
      console.log("******allSoldOutStore:"+JSON.stringify(this.stores[index].categories));
      let categories=this.stores[index].categories;
      for(let j=0;j<categories.length;j++){
          //console.log("allSoldOutStore:"+JSON.stringify(categories[j]));
          let menus=categories[j].menus;
          for(let i=0;i<menus.length;i++){
                if(menus[i].soldout=='0')
                    return false;
          }
      }
      return true;
  }

configureTextDecoration(category){
    if(this.allSoldOut(category)){
        return "overline line-through underline";
    }
    return "none";
}

configureTextDecorationStore(i){
    if(this.allSoldOutStore(i)){
        return "overline line-through underline";
    }
    return "none";
}

saleStore(store){
    let categories=[];
    store.categories.forEach(category=>{
        categories.push(category.categoryNO);
    });

    let body={ categories:categories,
               soldout:false,
               takitId:this.storageProvider.myshop.takitId
             };
           let confirm = this.alertController.create({
                message: store.name+'를 판매 하시겠습니까?',
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
                        this.serverProvider.post("/configureSoldOutCategory",JSON.stringify(body)).then((res:any)=>{
                            store.categories.forEach(category=>{
                                category.menus.forEach(menu=>{
                                        menu.soldout=false;
                                });
                            });    
                        },(err)=>{
                            let alert = this.alertController.create({
                                                title: '판매 설정에 실패했습니다.',
                                                subTitle: '네트웍 상태를 확인하시고 다시 시도해주시기 바랍니다.',
                                                buttons: ['OK']
                                            });
                            alert.present();
                        });
                    }}
                ]});
                confirm.present();
}

soldOutStore(store){
    let categories=[];
    store.categories.forEach(category=>{
        categories.push(category.categoryNO);
    });

    let body={ categories:categories,
               soldout:true,
               takitId:this.storageProvider.myshop.takitId
             };

    let confirm = this.alertController.create({
    message: store.name+'을 판매종료 하시겠습니까?',
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
            this.serverProvider.post("/configureSoldOutCategory",JSON.stringify(body)).then((res:any)=>{
                store.categories.forEach(category=>{
                    category.menus.forEach(menu=>{
                            menu.soldout=true;
                    });
                });    
                let alert = this.alertController.create({
                                    title: store.name+'이 판매종료 되었습니다',
                                    buttons: ['OK']
                                });
                alert.present();
                    
            },(err)=>{
                let alert = this.alertController.create({
                                    title: '판매종료 설정에 실패했습니다.',
                                    subTitle: '네트웍 상태를 확인하시고 다시 시도해주시기 바랍니다.',
                                    buttons: ['OK']
                                });
                alert.present();

            });
        }}
    ]});
    confirm.present();
}

saleCategory(category){
      let body={ categories:[category.categoryNO],
               soldout:false,
               takitId:this.storageProvider.myshop.takitId
             };
    let confirm = this.alertController.create({
        message: category.categoryName+'를 판매 하시겠습니까?',
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
                this.serverProvider.post("/configureSoldOutCategory",JSON.stringify(body)).then((res:any)=>{
                        category.menus.forEach(menu=>{
                                menu.soldout=false;
                        });
                },(err)=>{
                    let alert = this.alertController.create({
                                        title: '판매 설정에 실패했습니다.',
                                        subTitle: '네트웍 상태를 확인하시고 다시 시도해주시기 바랍니다.',
                                        buttons: ['OK']
                                    });
                    alert.present();
                });
            }}
        ]});
        confirm.present();
}

soldOutCategory(category){
    let body={ categories:[category.categoryNO],
               soldout:true,
               takitId:this.storageProvider.myshop.takitId
             };

    let confirm = this.alertController.create({
    message: category.categoryName+'을 판매종료 하시겠습니까?',
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
            this.serverProvider.post("/configureSoldOutCategory",JSON.stringify(body)).then((res:any)=>{
                
                    category.menus.forEach(menu=>{
                            menu.soldout=true;
                    });
                    
                let alert = this.alertController.create({
                                    title: category.categoryName+'이 판매종료 되었습니다',
                                    buttons: ['OK']
                                });
                alert.present();
                    
            },(err)=>{
                let alert = this.alertController.create({
                                    title: '판매종료 설정에 실패했습니다.',
                                    subTitle: '네트웍 상태를 확인하시고 다시 시도해주시기 바랍니다.',
                                    buttons: ['OK']
                                });
                alert.present();

            });
        }}
    ]});
    confirm.present();
}

  configureMenuColor(menu){
      console.log(menu.menuName+ " soldout:"+menu.soldout);
      if(menu.soldout==0){
          return 'white';
      }else{
          return '#bdbdbd';
      }
  }

  storeClick(i){
        this.storeSelected=i;
        this.nowStore=Object.assign({}, this.stores[this.storeSelected]); 
        if(this.nowStore.categories){
            this.categories=this.nowStore.categories;
            if(this.categories.length>0){
                this.nowMenus=this.categories[0].menus;
                for(var j=0;j<this.nowMenus.length;j++){
                    this.nowMenus[j].ngStyle={'background-image': 'url('+ this.storageProvider.awsS3+this.nowMenus[j].imagePath + ')'};
                }           
            }else{
                this.nowMenus=[];
            }
        }
        this.categorySelected=0; // hum...    
        this.categoryClick(0);
  }

  configureStoreButtonColor(i){
      if(i==this.storeSelected)
          return '#6441a5';
      else
          return '#bdbdbd';    

  }
}
