import { Component } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { SidebarComponent }  from '../sidebar/sidebar.component';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [
    CommonModule,    
    RouterModule,    
    SidebarComponent,
    ],
  templateUrl: './settings-layout.component.html',
  styleUrls: ['./settings-layout.component.scss']
})
export class SettingsLayoutComponent {}
