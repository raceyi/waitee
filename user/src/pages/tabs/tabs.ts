import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import {MyFavoritePage} from '../my-favorite/my-favorite';
import {MyInfoPage} from '../my-info/my-info';
import {OrderListPage} from '../order-list/order-list';
import {WalletPage} from '../wallet/wallet';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MyFavoritePage;
  tab3Root = OrderListPage;
  tab4Root = WalletPage;
  tab5Root = MyInfoPage;

  constructor() {

  }
  
}
