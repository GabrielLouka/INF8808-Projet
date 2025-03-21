import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
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

    // À continuer
    private createStackedAreaChart(targetTypeCategories: YearEntry[]) {
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3
            .select('#stacked-area-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Échelles
        const x = d3
            .scaleLinear()
            .domain(
                d3.extent(targetTypeCategories, (d) => d.year) as [
                    number,
                    number
                ]
            )
            .range([0, width]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(targetTypeCategories, (d) => d.total)!])
            .range([height, 0]);

        const color = d3
            .scaleOrdinal<string>()
            .domain(Object.values(TargetCategory))
            .range(d3.schemeCategory10);

        // Empiler les données
        const stack = d3
            .stack<YearEntry>()
            .keys(Object.values(TargetCategory))
            .value((d, key) => {
                const categoryEntry = d.counts.find(
                    (c) => c['category'] === key
                );
                return categoryEntry ? categoryEntry.count : 0;
            });

        const stackedData = stack(targetTypeCategories);

        // Créer les aires empilées
        const area = d3
            .area<d3.SeriesPoint<YearEntry>>()
            .x((d) => x(d.data.year))
            .y0((d) => y(d[0]))
            .y1((d) => y(d[1]));

        svg.selectAll('path')
            .data(stackedData)
            .enter()
            .append('path')
            .attr('fill', (d) => color(d.key))
            .attr('d', area)
            .style('stroke', 'black') // Ajoutez une bordure pour visualiser les aires
            .style('stroke-width', 1);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(targetTypeCategories.length)
                    .tickFormat(d3.format('d'))
            )
            .style('font-size', '12px');

        svg.append('g').call(d3.axisLeft(y)).style('font-size', '12px');

        this.generateLegend(svg, width, color);
    }

    private generateLegend(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        width: number,
        color: d3.ScaleOrdinal<string, string, never>
    ) {
        const legend = svg
            .selectAll('.legend')
            .data(Object.values(TargetCategory))
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(0,${i * 20})`);

        legend
            .append('rect')
            .attr('x', width - 18)
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', color)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        legend
            .append('text')
            .attr('x', width - 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .style('font-size', '12px')
            .text((d) => d);
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
