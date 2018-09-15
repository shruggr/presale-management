import { Injectable } from '@angular/core';
import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

let presaleAbi = require('../abi/CFPresale.json').abi;
let tokensAbi = require('../abi/CryptoItems.abi.json');

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  private _account: string = null;
  private _web3: any;

  private _tokensContract: any;
  private _presaleContract: any;
  //Kovan
  // private _tokensContractAddress: string = "0x8819a653b6c257b1e3356d902ecb1961d6471dd8";
  // private _presaleContractAddress: string = "0xC037412AFB2575622376BBbEC1394349AECB5580";

  //Mainnet
  private _tokensContractAddress: string = "0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab";
  private _presaleContractAddress: string = "0xAbfE3054ff31597B6C9538edA3D41d09c6a79FA7";

  constructor() {
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this._web3 = new Web3(window.web3.currentProvider);
    }

    this._tokensContract = new this._web3.eth.Contract(tokensAbi, this._tokensContractAddress);
    this._presaleContract = new this._web3.eth.Contract(presaleAbi, this._presaleContractAddress);
  }

  private async getAccount(): Promise<string> {
    let accounts:string[] = await this._web3.eth.getAccounts() as string[];
    return accounts[0];

  }

  public async getPresaleBalance(): Promise<Number> {
    let balance = await this._web3.eth.getBalance(this._presaleContractAddress);
    return this._web3.utils.fromWei(balance, 'ether')
  }

  public async getOwner(): Promise<string> {
    return this._presaleContract.methods.owner().call();
  }

  public async getTokenOwner(): Promise<string> {
    return this._presaleContract.methods.tokenOwner().call();
  }

  public async getPrice(itemId): Promise<string> {
    return this._presaleContract.methods.prices(itemId).call();
  }

  public async getBalance(itemId, owner): Promise<string> {
    return this._tokensContract.methods.balanceOf(itemId, owner).call();
  }

  public async getActivity(): Promise<any[]> {
    let events = await this._presaleContract.getPastEvents('Purchase', {
      fromBlock: 0
    });
    return events.map((event) => {
      return {
        tokenId: this._web3.utils.toHex(event.returnValues.tokenId).substring(0, 18),
        purchaser: event.returnValues.purchaser,
        referrer: event.returnValues.referrer,
        price: event.returnValues.price
      }
    });
  }

  public async getPaused(): Promise<any> {
    return this._presaleContract.methods.paused().call();
  }

  public async pause(): Promise<any> {
    let account = await this.getAccount();
    return this._presaleContract.methods.pause()
        .send({
          from: account
        })
  }

  public async unpause(): Promise<any> {
    let account = await this.getAccount();
    return this._presaleContract.methods.unpause()
        .send({
          from: account
        })
  }

  public async getApproved(): Promise<any> {
    let tokenOwner = await this.getTokenOwner();
    return this._tokensContract.methods
      .isApprovedForAll(
        tokenOwner,
        this._presaleContractAddress
      )
      .call();
  }

  public async setApproved(approved: Boolean): Promise<any> {
    let account = await this.getAccount();
    return this._tokensContract.methods
      .setApprovalForAll(
        this._presaleContractAddress,
        approved
      )
      .send({
        from: account
      });
  }

  public async withdraw(): Promise<any> {
    let account = await this.getAccount();
    return this._presaleContract.methods.withdrawETH().send({
      from: account
    });
  }

  public async transferOwnership(newOwner: string) {
    let account = await this.getAccount();
    return this._presaleContract.methods.transferOwnership(newOwner).send({
      from: account
    });
  }

  public async setPrices(tokenIds: string[], prices: string[]) {
    let account = await this.getAccount();
    return this._presaleContract.methods.setPrice(tokenIds, prices).send({
      from: account
    });
  }
}
