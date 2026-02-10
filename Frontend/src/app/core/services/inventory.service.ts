import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateInventoryItemDto, InventoryItemResponseDto } from '../models/api.models';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/inventory`;

    getAll(): Observable<InventoryItemResponseDto[]> {
        return this.http.get<InventoryItemResponseDto[]>(this.apiUrl);
    }

    create(dto: CreateInventoryItemDto): Observable<InventoryItemResponseDto> {
        return this.http.post<InventoryItemResponseDto>(this.apiUrl, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
