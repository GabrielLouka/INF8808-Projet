import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    data: d3.DSVRowArray<string> | null = null;

    loadData() {
        // from public folder
        d3.dsv(';', 'data/data_filtered.csv')
            .then((data) => {
                this.data = data;
                // TODO Remove all console.log once done
                console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }
}
