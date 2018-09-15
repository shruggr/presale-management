import { Pipe, PipeTransform } from '@angular/core';
import * as Web3 from 'web3';

@Pipe({
  name: 'weiToEth'
})
export class WeiToEthPipe implements PipeTransform {

  transform(value: string): any {
    if(!value) return;
    return Web3.utils.fromWei(value, 'ether');
  }

}
