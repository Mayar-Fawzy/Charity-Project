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
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

import { UserService, User } from './core/user.service';
import { NotificationService } from '../../../../settings/notifications/Core/notification.service';
import { SignalrService } from '../../../../settings/notifications/Core/signalr.service';

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
    DropdownModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUserId: string | null = null;
  filters: { [key: string]: any } = {};
  imageDialogVisible = false;
  selectedImageUrl: string = '';

  genderFilterOptions = [
    { label: 'ذكر', value: 0 },
    { label: 'أنثى', value: 1 },
  ];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private signalrService: SignalrService,
    private http: HttpClient,
  ) { }

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

  getGenderText(value: number): string {
    switch (value) {
      case 0: return 'ذكر';
      case 1: return 'أنثى';
      default: return '';
    }
  }

  getUserImage(user: User): string {
    if (user.imageUrl) {
      return user.imageUrl;
    }

    if (user.gender === 0) {
      return '/Images/undraw_male-avatar_zkzx.svg';
    } else if (user.gender === 1) {
      return '/Images/undraw_female-avatar_7t6k.svg';
    }

    return '/Images/undraw_male-avatar_zkzx.svg';
  }

  selectRow(userId: string): void {
    this.selectedUserId = userId;
  }

  openImage(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
    this.imageDialogVisible = true;
  }

  addUser(): void {
    alert('تم الضغط على زر إضافة مستخدم — يمكنك هنا فتح مودال أو التنقل لصفحة الإضافة');
  }

  exportToExcel(): void {
    const exportData = this.users.map((user) => ({
      الاسم: `${user.firstName} ${user.lastName}`,
      'البريد الإلكتروني': user.email,
      الجنس: this.getGenderText(user.gender),
      العنوان: user.address,
      'رقم الهاتف': user.phoneNumber,
      ' حالة الحساب': user.isLocked ? 'مغلق' : 'مفعل',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المستخدمين');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'users.xlsx');
  }

  onFilter(event: any): void {
    this.filters = event.filters;
  }

  deleteUser(user: User): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-danger me-2',
        cancelButton: 'btn btn-success',
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
            Swal.fire('تم التنفيذ!', `تم قفل حساب المستخدم ${user.firstName}.`, 'success');
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
            Swal.fire('تم التنفيذ!', `تم فتح حساب المستخدم ${user.firstName}.`, 'success');
          },
          error: (err) => {
            console.error('خطأ أثناء فتح الحساب', err);
            Swal.fire('خطأ!', 'حدث خطأ أثناء فتح الحساب.', 'error');
          },
        });
      }
    });
  }

  showUserMessages(user: User): void {
    const adminId = '5b61620b-d5d9-477d-bff0-bc278c44a8e3';
    const apiUrl = `https://givinghandcharity.runasp.net/api/v1/Notification/GetAllMessagesBySendId?SendId=${adminId}`;

    this.http.get<{ data: any[] }>(apiUrl).subscribe({
      next: (response) => {
        const allMessages = response.data || [];

        const userMessages = allMessages.filter(
          (msg) => !msg.receiverId || msg.receiverId.trim() === user.id.trim()
        );

        if (!userMessages.length) {
          Swal.fire('لا توجد رسائل', `لم يتم إرسال رسائل لهذا المستخدم.`, 'info');
          return;
        }

        const html = userMessages
          .map(
            (msg: any) => `
    <div id="msg-${msg.id}" style="position: relative; margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
      <button class="btn btn-sm btn-danger" style="position: absolute; top: 15px; left: 10px;"  onclick="deleteMessage('${msg.id}')">
        <i class="bi bi-trash"></i>
      </button>
      <button  class="btn btn-sm btn-warning" style="position: absolute; top: 15px; left: 50px;" onclick="editMessage('${msg.id}')">
        <i class="bi bi-pencil"></i>
      </button>
      <p style="margin: 0 0 5px 0; text-align: right;">
        <strong>الرسالة:</strong> <span id="msg-content-${msg.id}">${msg.message}</span>
      </p>
      <p style="margin: 0; text-align: right; font-size: 0.8em; color: #666;">
        ${msg.createdDate ? new Date(msg.createdDate).toLocaleDateString('ar-EG') : 'غير محدد'}
      </p>
    </div>`
          )
          .join('');

        Swal.fire({
          title: `رسائل ${user.firstName}`,
          html: html,
          width: 600,
          showCloseButton: true,
          showConfirmButton: false,
          didOpen: () => {
            (window as any).deleteMessage = (messageId: string) => {
              Swal.fire({
                title: 'هل أنت متأكد؟',
                text: 'سيتم حذف هذه الرسالة نهائيًا.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذفها',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#e74c3c',
                cancelButtonColor: '#6c757d',
              }).then((result) => {
                if (result.isConfirmed) {
                  const deleteUrl = `https://givinghandcharity.runasp.net/api/v1/Notification/DeleteMessage?messageId=${messageId}`;
                  this.http.delete(deleteUrl).subscribe({
                    next: () => {
                      const el = document.getElementById(`msg-${messageId}`);
                      if (el) el.remove();
                      Swal.fire('تم الحذف!', 'تم حذف الرسالة بنجاح.', 'success');
                    },
                    error: () => {
                      Swal.fire('خطأ', 'فشل في حذف الرسالة.', 'error');
                    },
                  });
                }
              });
            };

            (window as any).editMessage = (messageId: string) => {
              // Find the message object based on messageId from userMessages
              const msg = userMessages.find((m: any) => m.id === messageId);
              if (!msg) {
                Swal.fire('خطأ', 'لم يتم العثور على الرسالة.', 'error');
                return;
              }

              Swal.fire({
                title: 'تعديل الرسالة',
                input: 'textarea',
                inputLabel: 'محتوى الرسالة',
                inputValue: msg.message,
                inputAttributes: {
                  dir: 'rtl',
                  rows: '4',
                },
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#6c757d',
                preConfirm: async (newMessage) => {
                  if (!newMessage) {
                    Swal.showValidationMessage('الرسالة لا يمكن أن تكون فارغة');
                    return false;
                  }

                  try {
                    const updatedMessage = {
                      id: msg.id,
                      senderId: adminId, // Use the adminId as senderId
                      receiverId: user.id, // Use the user ID as receiverId
                      message: newMessage
                    };
                    await this.userService.updateMessage(updatedMessage).toPromise();
                    return newMessage;
                  } catch (error) {
                    Swal.showValidationMessage('فشل في تعديل الرسالة. حاول مرة أخرى.');
                    return false;
                  }
                },
              }).then((result) => {
                if (result.isConfirmed && result.value) {
                  const messageElement = document.getElementById(`msg-content-${msg.id}`);
                  if (messageElement) {
                    messageElement.textContent = result.value;
                  }
                  Swal.fire('تم التعديل!', 'تم تعديل الرسالة بنجاح.', 'success');
                }
              });
            };
          },
        });
      },
      error: (err) => {
        console.error('فشل في جلب الرسائل:', err);
        Swal.fire('خطأ', 'حدث خطأ أثناء جلب الرسائل.', 'error');
      },
    });
  }

  contactUser(user: User): void {
    const receiverId = user.id;
    const senderId = '5b61620b-d5d9-477d-bff0-bc278c44a8e3';

    if (!senderId) {
      Swal.fire('خطأ', 'تعذر تحديد هوية المرسل. يرجى تسجيل الدخول أولاً.', 'error');
      return;
    }

    Swal.fire({
      title: 'أدخل رسالتك',
      input: 'textarea',
      inputLabel: 'محتوى الرسالة',
      inputPlaceholder: 'اكتب رسالتك هنا...',
      showCancelButton: true,
      confirmButtonText: 'إرسال',
      cancelButtonText: 'إلغاء',
      inputAttributes: {
        dir: 'rtl',
        rows: '4',
      },
      preConfirm: async (message) => {
        if (!message) {
          Swal.showValidationMessage('الرسالة لا يمكن أن تكون فارغة');
          return false;
        }

        try {
          await this.notificationService
            .sendMessageToUser(senderId, receiverId, message)
            .toPromise();
          return true;
        } catch (error) {
          Swal.showValidationMessage('فشل إرسال الرسالة. حاول مرة أخرى.');
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('تم الإرسال', 'تم إرسال الرسالة بنجاح', 'success');
      }
    });
  }

  contactAllUser(): void {
    const senderId = '5b61620b-d5d9-477d-bff0-bc278c44a8e3';

    if (!senderId) {
      Swal.fire('خطأ', 'تعذر تحديد هوية المرسل. يرجى تسجيل الدخول أولاً.', 'error');
      return;
    }

    Swal.fire({
      title: 'أدخل رسالتك',
      input: 'textarea',
      inputLabel: 'محتوى الرسالة',
      inputPlaceholder: 'اكتب رسالتك هنا...',
      showCancelButton: true,
      confirmButtonText: 'إرسال',
      cancelButtonText: 'إلغاء',
      inputAttributes: {
        dir: 'rtl',
        rows: '4',
      },
      preConfirm: async (message) => {
        if (!message) {
          Swal.showValidationMessage('الرسالة لا يمكن أن تكون فارغة');
          return false;
        }

        try {
          await this.notificationService
            .sendMessageToAllUsers(senderId, message)
            .toPromise();
          return true;
        } catch (error) {
          Swal.showValidationMessage('فشل إرسال الرسالة. حاول مرة أخرى.');
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('تم الإرسال', 'تم إرسال الرسالة بنجاح', 'success');
      }
    });
  }
}