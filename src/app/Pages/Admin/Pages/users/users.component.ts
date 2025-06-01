import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  imageUrl: string;
  phoneNumber: string;
  dateOfBirth: string;
  age: number;
  gender: number;
  isActive: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  users: User[] = [
    {
      id: 'user-1',
      firstName: 'Ahmed',
      lastName: 'Saad',
      email: 'ahmed.lab505@gmail.com',
      address: 'shaben',
      imageUrl: 'https://givinghandcharity.runasp.net/UsersImages/62a5f2b8f0774a22b17408290200a840.jpeg',
      phoneNumber: '01153008952',
      dateOfBirth: '2005-05-05T00:00:00',
      age: 20,
      gender: 0,
      isActive: true,
    },
    {
      id: 'user-2',
      firstName: 'Ahmed',
      lastName: 'Saad',
      email: 'ahmed.lab505@gmail.com',
      address: 'shaben',
      imageUrl: 'https://givinghandcharity.runasp.net/UsersImages/62a5f2b8f0774a22b17408290200a840.jpeg',
      phoneNumber: '01153008952',
      dateOfBirth: '2005-05-05T00:00:00',
      age: 20,
      gender: 0,
      isActive: true,
    },
    {
      id: 'user-3',
      firstName: 'Ahmed',
      lastName: 'Saad',
      email: 'ahmed.lab505@gmail.com',
      address: 'shaben',
      imageUrl: 'https://givinghandcharity.runasp.net/UsersImages/62a5f2b8f0774a22b17408290200a840.jpeg',
      phoneNumber: '01153008952',
      dateOfBirth: '2005-05-05T00:00:00',
      age: 20,
      gender: 0,
      isActive: true,
    },
  ];

  addUser(): void {
    alert('تم الضغط على زر إضافة مستخدم — يمكنك هنا فتح مودال أو التنقل لصفحة الإضافة');
  }


  selectedImageUrl: string | null = null;

  openImageModal(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
  }


  selectedUserId: string | null = null;

  selectRow(userId: string): void {
    this.selectedUserId = userId;
  }

  getGenderText(gender: number): string {
    return gender === 0 ? 'ذكر' : 'أنثى';
  }

  deleteUser(user: User): void {
    if (confirm(`هل أنت متأكد من حذف المستخدم ${user.firstName}؟`)) {
      this.users = this.users.filter((u) => u.id !== user.id);
      if (this.selectedUserId === user.id) {
        this.selectedUserId = null;
      }
    }
  }

  contactUser(user: User): void {
    alert(`التواصل مع المستخدم: ${user.firstName} - ${user.email}`);
  }

  toggleStatus(user: User): void {
    user.isActive = !user.isActive;
  }

  exportToExcel(): void {
    const exportData = this.users.map(user => ({
      'الاسم': `${user.firstName} ${user.lastName}`,
      'البريد الإلكتروني': user.email,
      'الجنس': user.gender === 0 ? 'ذكر' : 'أنثى',
      'العنوان': user.address,
      'رقم الهاتف': user.phoneNumber,
      'العمر': user.age,
      'الحالة': user.isActive ? 'مفعل' : 'مغلق'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المستخدمين');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(blob, 'users.xlsx');
  }

}
