import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject } from 'rxjs';
import { CountEntry, DataField, YearEntry } from '../../models/data';

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
    ): YearEntry[] {
        const allFieldValues: Set<string> = new Set();
        data.forEach((rawEntry) => {
            const fieldValue = rawEntry[fieldName];
            if (fieldValue && fieldValue !== 'Unknown') {
                allFieldValues.add(fieldValue);
            }
        });

        const groupedData = data.reduce((acc: YearEntry[], rawEntry) => {
            const year: number = +rawEntry['iyear'];
            const fieldValue: string = rawEntry[fieldName];

            if (!fieldValue || fieldValue === 'Unknown') return acc;

            let yearData = acc.find((entry: YearEntry) => entry.year === year);

            if (!yearData) {
                yearData = { year, total: 0, counts: [] };

                allFieldValues.forEach((value) => {
                    yearData!.counts.push({ field: value, count: 0 });
                });
                acc.push(yearData);
            }

            const countEntryToUpdate = yearData.counts.find(
                (countEntry: CountEntry) => countEntry['field'] === fieldValue
            );

            if (countEntryToUpdate) {
                countEntryToUpdate.count += 1;
                yearData.total += 1;
            }

            return acc;
        }, []);

        return groupedData;
    }
}
