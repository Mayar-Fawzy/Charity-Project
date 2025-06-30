import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../../Auth/core/Environment/Environment';

@Injectable({
    providedIn: 'root'
})
export class AidDistributionService {
    private readonly _HttpClient = inject(HttpClient);

    getAllAidDistributions(): Observable<any> {
        return this._HttpClient.get(`${Environment.baseUrl}${Environment.VersionUrl}AidDistribution/GetAllAidDistributions`);
    }

}
