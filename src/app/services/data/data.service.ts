import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';
import { DataField } from '../../models/data';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private dataSubject = new BehaviorSubject<d3.DSVRowArray<string> | null>(
        null
    );
    data$ = this.dataSubject.asObservable();

    // Méthode appelée une seule fois dans la composante App
    loadData() {
        // Load data from the public folder
        d3.dsv(';', 'data/data_filtered.csv')
            .then((data) => {
                this.dataSubject.next(data);
            })
            .catch((error) => {
                console.error('Error loading data:', error);
            });
    }

    // Pour data viz 1 et 2
    groupDataByYear(
        data: d3.DSVRowArray<string>,
        fieldName: DataField
    ): { [field: string]: string | number }[] {
        const allFieldValues: Set<string> = new Set();
        data.forEach((d) => {
            const fieldValue = d[fieldName];
            if (fieldValue && fieldValue !== 'Unknown') {
                allFieldValues.add(fieldValue);
            }
        });

        const groupedData = data.reduce((acc: any[], d) => {
            const year = d['iyear'];
            const fieldValue = d[fieldName];

            if (!fieldValue || fieldValue === 'Unknown') return acc;

            let yearData = acc.find(
                (dataEntry: any) => dataEntry.year === year
            );

            if (!yearData) {
                yearData = { year };
                allFieldValues.forEach((value) => (yearData![value] = 0));
                acc.push(yearData);
            }

            yearData[fieldValue] = (yearData[fieldValue] || 0) + 1;

            return acc;
        }, []);

        const totalizedGroupedData = groupedData.map((dataEntry: any) => {
            dataEntry.total = Object.keys(dataEntry).reduce(
                (sum, key) => (key !== 'year' ? sum + dataEntry[key] : sum),
                0
            );
            return dataEntry;
        });

        return totalizedGroupedData;
    }
}
