import { Component } from '@angular/core';
import { BlockUIService } from '../../services/block-ui.service';

@Component({
  selector: 'app-block-ui',
  templateUrl: './block-ui.component.html',
  styleUrls: ['./block-ui.component.scss']
})
export class BlockUiComponent {

  constructor(private blockUIService: BlockUIService) { 
    this.blockUIService.blockUIEvent.subscribe(
      (event: boolean) => {
        if(event) {
          this.block++;
        } else {
          this.block--;
        }
      }
    )
  }

  block = 0;

 
}
