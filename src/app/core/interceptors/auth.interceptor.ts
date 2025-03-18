import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { LoginService } from '../../Pages/Auth/core/Services/login.service';
import { RefTokenService } from '../../Pages/Auth/core/Services/ref-token.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly _RefTokenService = inject(RefTokenService);

  private readonly _LoginService = inject(LoginService);
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('userToken');

    // إضافة التوكين إلى كل الطلبات
    let authReq = req;
   
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // إذا كان الخطأ بسبب انتهاء صلاحية التوكين
        if (error.error.statusCode === 401) {
          return this._RefTokenService.refreshToken().pipe(
            switchMap((newToken) => {
              // إعادة إرسال الطلب الأصلي بعد تحديث التوكين
              const newAuthReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next.handle(newAuthReq);
            }),
            catchError((refreshError) => {
              // إذا فشل تحديث التوكين، يتم تسجيل خروج المستخدم
              this._LoginService.signOut();
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}