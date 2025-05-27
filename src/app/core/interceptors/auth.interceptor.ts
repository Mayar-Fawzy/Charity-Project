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

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check for 401 error more safely
        if (error.status === 401) { // Use error.status instead of error.error.statusCode
          return this._RefTokenService.refreshToken().pipe(
            switchMap((newToken) => {
              const newAuthReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next.handle(newAuthReq);
            }),
            catchError((refreshError) => {
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