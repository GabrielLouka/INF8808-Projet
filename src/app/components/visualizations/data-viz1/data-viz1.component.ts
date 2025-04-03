import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { TargetCategory } from '../../../models/category';
import { DataField, YearEntry } from '../../../models/data';
import { DataService } from '../../../services/data/data.service';
import { LoaderComponent } from '../../loader/loader.component';

type Scales = {
    x: d3.ScaleLinear<number, number>;
    y: d3.ScaleLinear<number, number>;
    color: d3.ScaleOrdinal<string, string, never>;
};

type Dimensions = {
    width: number;
    height: number;
};

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
                    this.dataService.categorizeTargetTypeData(targetTypeData);

                this.createStackedAreaChart(targetTypeCategories);
                this.isLoading = false;
            }
        });
    }

    private createStackedAreaChart(targetTypeCategories: YearEntry[]) {
        const margins = { top: 50, right: 60, bottom: 50, left: 60 };
        const dimensions = {
            width: 1000 - margins.left - margins.right,
            height: 500 - margins.top - margins.bottom,
        };

        const svg = d3
            .select('#stacked-area-chart')
            .append('svg')
            .attr('width', dimensions.width + margins.left + margins.right)
            .attr('height', dimensions.height + margins.top + margins.bottom)
            .append('g')
            .attr('transform', `translate(${margins.left},${margins.top})`);

        svg.append('text')
            .attr('x', dimensions.width / 2)
            .attr('y', -margins.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text(
                'Évolution des attaques terroristes aux États-Unis par catégorie de cibles entre 1990 et 2015'
            );

        const scales = this.createScales(dimensions, targetTypeCategories);
        const stackedData = this.stackData(targetTypeCategories);

        this.addGridLines(svg, scales, dimensions);
        this.drawStackedAreas(svg, scales, stackedData);
        this.drawAxes(svg, dimensions, scales, targetTypeCategories);
        this.addAxisLabels(svg, dimensions);
        this.generateLegend(svg, dimensions, scales);
        this.addHoverEffect(svg, scales, dimensions, targetTypeCategories);
    }

    private generateTooltipContent(yearData: YearEntry): string {
        const sortedCounts = [...yearData.counts].sort(
            (a, b) => b.count - a.count
        );

        let content = `
            <div class="tooltip-year">Année ${yearData.year}</div>
            <div class="tooltip-total">${yearData.total.toLocaleString()} attaques</div>
            <hr>
        `;

        sortedCounts.forEach((item) => {
            const percentage = ((item.count / yearData.total) * 100).toFixed(1);
            content += `
                <div class="tooltip-category">
                    <span class="category-name">${item['category']}:</span>
                    <span class="category-value">${item.count.toLocaleString()} (${percentage}%)</span>
                </div>
            `;
        });

        return content;
    }

    private addGridLines(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        scales: Scales,
        dimensions: Dimensions
    ) {
        svg.append('g')
            .selectAll('.grid')
            .data(scales.y.ticks(10))
            .join('line')
            .attr('class', 'grid')
            .attr('x1', 0)
            .attr('x2', dimensions.width)
            .attr('y1', (d) => scales.y(d))
            .attr('y2', (d) => scales.y(d))
            .style('stroke', '#ccc')
            .style('stroke-width', '1');
    }

    private createScales(
        dimensions: Dimensions,
        targetTypeCategories: YearEntry[]
    ) {
        const x = d3
            .scaleLinear()
            .domain(
                d3.extent(targetTypeCategories, (d) => d.year) as [
                    number,
                    number
                ]
            )
            .range([0, dimensions.width]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(targetTypeCategories, (d) => d.total)!])
            .range([dimensions.height, 0]);

        const color = d3
            .scaleOrdinal<string>()
            .domain(Object.values(TargetCategory))
            .range(d3.schemeCategory10);

        return { x, y, color };
    }

    private stackData(targetTypeCategories: YearEntry[]) {
        const stack = d3
            .stack<YearEntry>()
            .keys(Object.values(TargetCategory))
            .value((d, key) => {
                const categoryEntry = d.counts.find(
                    (c) => c['category'] === key
                );
                return categoryEntry ? categoryEntry.count : 0;
            });

        return stack(targetTypeCategories);
    }

    private drawStackedAreas(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        scales: Scales,
        stackedData: d3.Series<YearEntry, string>[]
    ) {
        const area = d3
            .area<d3.SeriesPoint<YearEntry>>()
            .x((d) => scales.x(d.data.year))
            .y0((d) => scales.y(d[0]))
            .y1((d) => scales.y(d[1]));

        svg.selectAll('path')
            .data(stackedData)
            .join('path')
            .attr('fill', (d) => scales.color(d.key))
            .attr('d', area);
    }

    private drawAxes(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        dimensions: Dimensions,
        scales: Scales,
        targetTypeCategories: YearEntry[]
    ) {
        svg.append('g')
            .attr('transform', `translate(0,${dimensions.height})`)
            .call(
                d3
                    .axisBottom(scales.x)
                    .ticks(targetTypeCategories.length)
                    .tickFormat(d3.format('d'))
            )
            .style('font-size', '12px');

        svg.append('g').call(d3.axisLeft(scales.y)).style('font-size', '12px');
    }

    private addAxisLabels(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        dimensions: Dimensions
    ) {
        const offset = 50;
        svg.append('text')
            .attr('x', dimensions.width / 2)
            .attr('y', dimensions.height + offset)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Années');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -dimensions.height / 2)
            .attr('y', -offset)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text("Nombre total d'attaques terroristes");
    }

    private generateLegend(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        dimensions: Dimensions,
        scales: Scales
    ) {
        const legend = svg
            .selectAll('.legend')
            .data(Object.values(TargetCategory))
            .join('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(0,${i * 20})`);

        legend
            .append('rect')
            .attr('x', dimensions.width - 18)
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', scales.color)
            .style('stroke', 'black')
            .style('stroke-width', 1);

        legend
            .append('text')
            .attr('x', dimensions.width - 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .style('font-size', '14px')
            .text((d) => d);
    }

    private addHoverEffect(
        svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
        scales: Scales,
        dimensions: Dimensions,
        targetTypeCategories: YearEntry[]
    ) {
        const hoverGroup = svg.append('g').attr('class', 'hover-group');

        const hoverLine = hoverGroup
            .append('line')
            .attr('class', 'hover-line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', dimensions.height)
            .style('stroke', '#333')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '3,3')
            .style('opacity', 0);

        const hoverZone = svg
            .append('rect')
            .attr('class', 'hover-zone')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .on('mouseover', () => hoverLine.style('opacity', 1))
            .on('mouseout', () => {
                hoverLine.style('opacity', 0);
                d3.select('#tooltip').style('opacity', 0);
            })
            .on('mousemove', (event) => {
                const mouseX = d3.pointer(event)[0];
                const year = Math.round(scales.x.invert(mouseX));

                const closestYearData = targetTypeCategories.reduce(
                    (prev, curr) =>
                        Math.abs(curr.year - year) < Math.abs(prev.year - year)
                            ? curr
                            : prev
                );

                const xPos = scales.x(closestYearData.year);

                hoverLine.attr('x1', xPos).attr('x2', xPos);

                const tooltip = d3.select('#tooltip');
                tooltip
                    .html(this.generateTooltipContent(closestYearData))
                    .style('opacity', 1)
                    .style('left', `${xPos + 60}px`)
                    .style('top', `${d3.pointer(event)[1] + 60}px`);
            });
    }
}
