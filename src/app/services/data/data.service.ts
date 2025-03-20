import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private dataSubject = new BehaviorSubject<d3.DSVRowArray<string> | null>(
        null
    );
    data$ = this.dataSubject.asObservable();

    loadData() {
        // Load data from the public folder
        d3.dsv(';', 'data/data_filtered.csv')
            .then((data) => {
                this.dataSubject.next(data);
                // console.log('Data loaded:', data);
            })
            .catch((error) => {
                // console.error('Error loading data:', error);
            });
    }
}
