import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummaryDto } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/dashboard`;

    getSummary(): Observable<DashboardSummaryDto> {
        return this.http.get<DashboardSummaryDto>(`${this.apiUrl}/summary`);
    }
}
