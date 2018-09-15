import { Component } from '@angular/core';
import { ContractsService } from './contracts.service';

declare let require: any;
//Mainnet
// let items = require('../abi/data.json');

//Kovan
let items = require('../abi/kovan-data.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _cs: ContractsService;

  public items: any[] = items.filter((item) => item.ID);
  public owner: string;
  public newOwner: string;
  public tokenOwner: string;
  public events: any[];
  public balance: Number;
  public paused: Boolean;
  public approved: Boolean;

  constructor(cs: ContractsService) {
    this._cs = cs;
    this.init(cs);
  }

  async init(cs) {
    cs.getOwner().then((owner) => this.owner = owner);
    cs.getActivity().then((events) => this.events = events);
    cs.getPresaleBalance().then((balance) => this.balance = balance);
    cs.getPaused().then((paused) => this.paused = paused);
    cs.getApproved().then((approved) => this.approved = approved);
    this.tokenOwner = await cs.getTokenOwner();
    this.items.forEach((item) => {
      cs.getPrice(item.ID).then((price) => item.contractPrice = price);
      cs.getBalance(item.ID, this.tokenOwner).then((balance) => item.balance = balance);
    });
  }

  onCashout(): void {
    this._cs.withdraw();
  }

  async onPause(): Promise<any> {
    return this._cs.pause();
    // this.paused = await this._cs.getPaused();
  }

  async onUnpause(): Promise<any> {
    return this._cs.unpause();
    // this.paused = await this._cs.getPaused();
  }

  async onApprove(): Promise<any> {
    return this._cs.setApproved(true);
  }

  async onRevoke(): Promise<any> {
    return this._cs.setApproved(false);
  }

  async onTransferOwnership(): Promise<any> {
    return this._cs.transferOwnership(this.newOwner);
  }

  async onUpdatePrices(): Promise<any> {
    let tokenIds = this.items.map((item) => item.ID);
    let prices = this.items.map((item) => item.Price);
    return this._cs.setPrices(tokenIds, prices);
  }
}
