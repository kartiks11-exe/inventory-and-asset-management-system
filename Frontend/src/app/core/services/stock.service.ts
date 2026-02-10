import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockOperationDto } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/stock`;

    stockIn(dto: StockOperationDto): Observable<number> {
        return this.http.post<number>(`${this.apiUrl}/in`, dto);
    }

    stockOut(dto: StockOperationDto): Observable<number> {
        return this.http.post<number>(`${this.apiUrl}/out`, dto);
    }
}
