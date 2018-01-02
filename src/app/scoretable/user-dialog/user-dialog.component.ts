import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {

  userName: string;
  constructor() { }

  ngOnInit() {
  }

  insertPlayer()
  {
    console.log(this.userName);
  }
}
