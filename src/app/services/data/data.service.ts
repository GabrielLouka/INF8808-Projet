import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TARGET_CATEGORY_MAPPING, TargetCategory } from '../../models/category';
import { CountEntry, DataField, YearEntry, MonthEntry,  } from '../../models/data';



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

    // Viz 1 et 2
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

    // Viz 1
    categorizeTargetTypeData(yearlyData: YearEntry[]): YearEntry[] {
        const categorizedData = yearlyData.map((yearEntry: YearEntry) => {
            const { year, total, counts } = yearEntry;

            const categoryCountData: CountEntry[] = [
                { category: TargetCategory.GovernmentAndSecurity, count: 0 },
                { category: TargetCategory.PrivateSectorAndMedia, count: 0 },
                {
                    category: TargetCategory.InfrastructureAndTransport,
                    count: 0,
                },
                {
                    category: TargetCategory.CiviliansAndSocialInstitutions,
                    count: 0,
                },
                { category: TargetCategory.Others, count: 0 },
            ];

            counts.forEach((targetTypeCountEntry: CountEntry) => {
                const category =
                    TARGET_CATEGORY_MAPPING[targetTypeCountEntry['field']] ||
                    'Unknown';

                const categoryCountEntry = categoryCountData.find(
                    (categoryCountEntry: CountEntry) =>
                        categoryCountEntry['category'] === category
                );

                categoryCountEntry!.count += targetTypeCountEntry.count;
            });

            return { year, total, counts: categoryCountData };
        });

        return categorizedData;
    }

    getMonthlyDeathData(): Observable<MonthEntry[]> {
        return this.data$.pipe(
          map(data => {
            if (!data) return [];
            
            // Process all target types and their total deaths across all years
            const targetTypes = new Map<string, number>();
            data.forEach(entry => {
              const target = entry['targtype1_txt'];
              const deaths = +(entry['nkill'] || 0);
              if (target && deaths > 0) {
                targetTypes.set(target, (targetTypes.get(target) || 0) + deaths);
              }
            });
      
            // Sort targets by death count (highest first)
            const sortedTargets = Array.from(targetTypes.entries())
              .sort((a, b) => b[1] - a[1]);
            
            // Take top 8 targets plus "Other" for better visibility
            const topTargets = sortedTargets.slice(0, 8).map(t => t[0]);
            
            // Process data by month (aggregating across all years)
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const result: MonthEntry[] = [];
            
            monthNames.forEach((monthName, monthIndex) => {
              const monthNum = monthIndex + 1;
              const monthEntries = data.filter(entry => +entry['imonth'] === monthNum);
              
              const counts: CountEntry[] = [];
              let totalDeaths = 0;
              
              // Process top targets
              topTargets.forEach(target => {
                const deaths = monthEntries
                  .filter(entry => entry['targtype1_txt'] === target)
                  .reduce((sum, entry) => sum + (+(entry['nkill'] || 0)), 0);
                
                if (deaths > 0) {
                  counts.push({ category: target, count: deaths });
                  totalDeaths += deaths;
                }
              });
              
              // Group remaining as "Other" if significant
              const otherDeaths = monthEntries
                .filter(entry => entry['targtype1_txt'] && !topTargets.includes(entry['targtype1_txt']))
                .reduce((sum, entry) => sum + (+(entry['nkill'] || 0)), 0);
              
                if (otherDeaths > 0) {
                    counts.push({ category: 'Other', count: otherDeaths });
                  }
              
              if (counts.length > 0) {
                result.push({
                  month: monthName,
                  counts,
                  total: totalDeaths
                });
              }
            });
            
            return result;
          })
        );
      }
}
    

    

