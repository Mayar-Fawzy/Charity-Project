import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { UserService, User } from './core/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    ImageModule,
    InputTextModule,
    DropdownModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUserId: string | null = null;

  filters: { [key: string]: any } = {};

  genderFilterOptions = [
    { label: 'ذكر', value: 0 },
    { label: 'أنثى', value: 1 },
  ];

  imageDialogVisible = false;
  selectedImageUrl: string = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => {
        console.error('فشل تحميل المستخدمين', err);
        alert('حدث خطأ أثناء تحميل المستخدمين');
      },
    });
  }

  selectRow(userId: string): void {
    this.selectedUserId = userId;
  }

  getGenderText(gender: number): string {
    return gender === 0 ? 'ذكر' : 'أنثى';
  }

  deleteUser(user: User): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'هل أنت متأكد؟',
        text: `سيتم حذف المستخدم ${user.firstName} نهائيًا!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، احذفه!',
        cancelButtonText: 'لا، إلغاء',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.userService.deleteUser(user.id).subscribe({
            next: () => {
              this.users = this.users.filter((u) => u.id !== user.id);
              if (this.selectedUserId === user.id) {
                this.selectedUserId = null;
              }
              swalWithBootstrapButtons.fire({
                title: 'تم الحذف!',
                text: `تم حذف المستخدم ${user.firstName} بنجاح.`,
                icon: 'success',
              });
            },
            error: (err) => {
              console.error('خطأ أثناء حذف المستخدم', err);
              Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء محاولة حذف المستخدم.',
                icon: 'error',
              });
            },
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: 'تم الإلغاء',
            text: 'المستخدم لم يُحذف.',
            icon: 'error',
          });
        }
      });
  }

  lockAccount(user: User): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `سيتم قفل الحساب للمستخدم ${user.firstName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، قفل',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.lockAccount(user.email).subscribe({
          next: () => {
            user.isLocked = true;
            Swal.fire(
              'تم التنفيذ!',
              `تم قفل حساب المستخدم ${user.firstName}.`,
              'success'
            );
          },
          error: (err) => {
            console.error('خطأ أثناء قفل الحساب', err);
            Swal.fire('خطأ!', 'حدث خطأ أثناء قفل الحساب.', 'error');
          },
        });
      }
    });
  }

  unlockAccount(user: User): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `سيتم فتح الحساب للمستخدم ${user.firstName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، فتح',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.unlockAccount(user.email).subscribe({
          next: () => {
            user.isLocked = false;
            Swal.fire(
              'تم التنفيذ!',
              `تم فتح حساب المستخدم ${user.firstName}.`,
              'success'
            );
          },
          error: (err) => {
            console.error('خطأ أثناء فتح الحساب', err);
            Swal.fire('خطأ!', 'حدث خطأ أثناء فتح الحساب.', 'error');
          },
        });
      }
    });
  }

  contactUser(user: User): void {
    alert(`التواصل مع المستخدم: ${user.firstName} - ${user.email}`);
  }

  openImage(imageUrl: string) {
    this.selectedImageUrl = imageUrl;
    this.imageDialogVisible = true;
  }

  addUser(): void {
    alert(
      'تم الضغط على زر إضافة مستخدم — يمكنك هنا فتح مودال أو التنقل لصفحة الإضافة'
    );
  }

  exportToExcel(): void {
    const exportData = this.users.map((user) => ({
      الاسم: `${user.firstName} ${user.lastName}`,
      'البريد الإلكتروني': user.email,
      الجنس: this.getGenderText(user.gender),
      العنوان: user.address,
      'رقم الهاتف': user.phoneNumber,
      الحالة: user.isLocked ? 'مغلق' : 'مفعل',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المستخدمين');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'users.xlsx');
  }

  onFilter(event: any): void {
    this.filters = event.filters;
  }
}
