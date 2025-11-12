import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-help',
  imports: [RouterLink],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  private location = inject(Location);

  /**
   * handle to move back to the previous page
   */
  goBack() {
    this.location.back();
  }
}
