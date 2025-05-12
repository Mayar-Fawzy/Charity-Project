import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-donations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-donations.component.html',
  styleUrls: ['./item-donations.component.scss']
})
export class ItemDonationsComponent {

  volunteerActivities: any[] = [];
  sortedActivities: any[] = [];
  sortOrder: string = 'newest';
  activityForm: any = {
    title: '',
    description: ''
  };

  selectedActivity: any = null;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    this.volunteerActivities = [
      {
        title: 'ملابس شتوية للأطفال',
        description: 'جمع وتوزيع ملابس شتوية بحالة جيدة للأطفال المحتاجين في القرى النائية.',
        createdAt: new Date('2025-05-12')
      },
      {
        title: 'ملابس شتوية للأطفال',
        description: 'جمع وتوزيع ملابس شتوية بحالة جيدة للأطفال المحتاجين في القرى النائية.',
        createdAt: new Date('2025-05-12')
      },
      {
        title: 'ملابس شتوية للأطفال',
        description: 'جمع وتوزيع ملابس شتوية بحالة جيدة للأطفال المحتاجين في القرى النائية.',
        createdAt: new Date('2025-05-12')
      },
      {
        title: 'ملابس شتوية للأطفال',
        description: 'جمع وتوزيع ملابس شتوية بحالة جيدة للأطفال المحتاجين في القرى النائية.',
        createdAt: new Date('2025-05-12')
      },
      {
        title: 'ملابس شتوية للأطفال',
        description: 'جمع وتوزيع ملابس شتوية بحالة جيدة للأطفال المحتاجين في القرى النائية.',
        createdAt: new Date('2025-05-12')
      },
      
    ];

    this.sortActivities();
  }

  openAddModal(content: any) {
    this.selectedActivity = null;
    this.activityForm = { title: '', description: '' };
    this.modalService.open(content);
  }

  openEditModal(activity: any, content: any) {
    this.selectedActivity = activity;
    this.activityForm = { ...activity };
    this.modalService.open(content);
  }

  saveActivity(modal: any) {
    if (this.selectedActivity) {
      Object.assign(this.selectedActivity, this.activityForm);
    } else {
      const newActivity = {
        ...this.activityForm,
        createdAt: new Date()
      };
      this.volunteerActivities.push(newActivity);
    }

    modal.close();
    this.sortActivities();
  }

  deleteActivity(activity: any) {
    this.volunteerActivities = this.volunteerActivities.filter(a => a !== activity);
    this.sortActivities();
  }

  sortActivities() {
    this.sortedActivities = [...this.volunteerActivities].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }

  truncate(text: string, limit: number): string {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  }

  openModal(description: string): void {
    this.selectedActivity.description = description;
    this.modalService.open(description);
  }
}
