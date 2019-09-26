import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem, CdkDrag} from '@angular/cdk/drag-drop';
import {ItemComponent} from '../../interfaces/item-component';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {
  components: object[];
  todo: string[];
  board: ItemComponent[];
  template ="Template";
  boardMain = "Board";
  componentsTitle = "Components";
  itemPrompt: string;
  idForBoard: number;



  constructor() { }

  ngOnInit() {
  
    this.components = [
    {
      'id':1,
      'title':'Title',
      'prompt':'',
      'width':4,
      'colwidths':'',
      'main':true,
      'editing':false
    },
    {
      'id':2,
      'title':'Field',
      'type':'header',
      'prompt':'',
      'default':'',
      'row':1,
      'colspan':2,
      'halign':'center',
      'editing':false
    },
    {
      'id':3,
      'title':'Text',
      'type':'textbox',
      'prompt':'',
      'default':'',
      'row':1,
      'colspan':2,
      'editing':false
    },
    {
      'id':4,
      'title':'ComboBox',
      'type':'combobox',
      'prompt':'',
      'default': [{
        'type':'combo',
        'id':'',
        'prompt':''
      },{
        'type':'combo',
        'id':'',
        'prompt':''
      },{
        'type':'combo',
        'id':'',
        'prompt':''
      }]
      ,
      'row':1,
      'colspan':2,
      'halign':'left',
      'editing':false
    },
    {
      'id':5,
      'title':'Radio',
      'type':'prompt',
      'prompt':'',
      'default':[{
        'type':'radio',
        'id':'',
        'prompt':''
      },{
        'type':'radio',
        'id':'',
        'prompt':''
      },{
        'type':'radio',
        'id':'',
        'prompt':''
      }],
      'row':1,
      'colspan':2,
      'editing':false
    },
    {
      'id':6,
      'title':'Button',
      'type':'submit',
      'prompt':'',
      'default':'',
      'row':1,
      'width':5,
      'colspan':2,
      'hiddenInMobile':true,
      'editing':false
    }
  ];
  this.todo = [
    'Get to work',
    'Pick up groceries',
    'Go home',
    'Fall asleep'
  ];

  this.board = [
    
  ];
  
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      
      
    }
  }
  noReturnPredicate() {
    return false;
  }
  addItem(itemPrompt: string): void{

    this.board.push({
      
        'id':1,
        'title':'Title',
        'prompt':this.itemPrompt,
        'width':4,
        'colwidths':'',
        'main':true,
        'editing':false
      
    })
  }
  
  editItem(item:ItemComponent): void{
    item.editing=true;
  }
  deleteItem(id:number){
    console.log("deleting id: "+id);
    this.board = this.board.filter(board=>board.id!==id);
  }
}
