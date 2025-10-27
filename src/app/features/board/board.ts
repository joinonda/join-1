import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDropList,
  CdkDrag,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {}
