import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    TARGET_CATEGORY_MAPPING,
    TargetCategory,
} from '../../../models/category';
import { CountEntry, DataField, YearEntry } from '../../../models/data';
import { DataService } from '../../../services/data/data.service';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
    selector: 'app-data-viz1',
    imports: [LoaderComponent, CommonModule],
    templateUrl: './data-viz1.component.html',
    styleUrl: './data-viz1.component.scss',
})
export class DataViz1Component implements OnInit {
    protected isLoading: boolean = true;

    // Data viz 1: stacked area chart (selon mockup)
    constructor(private dataService: DataService) {}

    ngOnInit(): void {
        this.getData();
    }

    private getData() {
        this.dataService.data$.subscribe((data) => {
            if (data) {
                const targetTypeData = this.dataService.groupDataByYear(
                    data,
                    DataField.TargetType
                );

                const targetTypeCategories =
                    this.categorizeTargetTypeData(targetTypeData);

                this.createStackedAreaChart(targetTypeCategories);
                this.isLoading = false;
            }
        });
    }

    private createStackedAreaChart(targetTypeCategories: YearEntry[]) {
        // const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        // const width = 800 - margin.left - margin.right;
        // const height = 400 - margin.top - margin.bottom;
        // const svg = d3
        //     .select('#stacked-area-chart')
        //     .append('svg')
        //     .attr('width', width + margin.left + margin.right)
        //     .attr('height', height + margin.top + margin.bottom)
        //     .append('g')
        //     .attr('transform', `translate(${margin.left},${margin.top})`);
        // const x = d3.scaleLinear().domain([1990, 2015]).range([0, width]);
        // const y = d3
        //     .scaleLinear()
        //     .domain([0, d3.max(targetTypeCategories, (d) => d.total)])
        //     .range([height, 0]);
        // const color = d3.scaleOrdinal(d3.schemeCategory10);
        // Stack the data
        // const stack = d3
        //     .stack()
        //     .keys(
        //         Object.keys(targetTypeCategories[0]).filter(
        //             (key) => key !== 'year' && key !== 'total'
        //         )
        //     )
        //     .order(d3.stackOrderNone)
        //     .offset(d3.stackOffsetNone);
        // const stackedData = stack(targetTypeCategories);
        // console.log(stackedData);
        // // Area generator
        // const area = d3
        //     .area()
        //     .x((d) => x(d.data.year))
        //     .y0((d) => y(d[0]))
        //     .y1((d) => y(d[1]));
        // // Add the areas using .join()
        // svg.selectAll('.area')
        //     .data(stackedData)
        //     .join('path')
        //     .attr('class', 'area')
        //     .attr('d', area)
        //     .style('fill', (d, i) => color(i));
        // // Add the X Axis
        // svg.append('g')
        //     .attr('transform', `translate(0,${height})`)
        //     .call(d3.axisBottom(x).ticks(25).tickFormat(d3.format('d')));
        // // Add the Y Axis
        // svg.append('g').call(d3.axisLeft(y));
    }

    private categorizeTargetTypeData(yearlyData: YearEntry[]): YearEntry[] {
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
}
