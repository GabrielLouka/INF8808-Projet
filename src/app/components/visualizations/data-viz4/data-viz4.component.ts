import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../../../services/data/data.service';
import { HeatmapCell } from '../../../models/data';
import { NgIf } from '@angular/common'; 

@Component({
    selector: 'app-data-viz4',
    standalone: true,
    imports: [NgIf],
    templateUrl: './data-viz4.component.html',
    styleUrls: ['./data-viz4.component.scss']
  })
  
export class DataViz4Component implements OnInit {
  isLoading = true;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getWeaponMonthFrequencyData().subscribe((data) => {
      this.createHeatmap(data);
      d3.select('.heatmap-tooltip').remove(); 
      d3.select('body')
      .append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0);

      this.isLoading = false;
    });
  }

  private createHeatmap(data: HeatmapCell[]): void {
    d3.select('#heatmap-container-viz4').selectAll('*').remove();
    const margin = { top: 50, right: 30, bottom: 50, left: 250 };
    const width = 1300 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    const svg = d3.select('#heatmap-container-viz4')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const months = [
      'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
      'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
    ];
    const categories = Array.from(new Set(data.map(d => d.category)));

    const x = d3.scaleBand()
      .range([0, width])
      .domain(months)
      .padding(0.05);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(categories)
      .padding(0.05);

    const color = d3.scaleSequential(d3.interpolateOrRd)
      .domain([0, d3.max(data, d => d.deaths) || 1]);

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.selectAll('.tick text')
      .style('font-size', '12px')
      .style('fill', '#333');
      svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#444')
      .text('Mois');
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#444')
      .text('Type d’arme');

    svg.selectAll()
  .data(data)
  .enter()
  .append('rect')
  .attr('x', d => x(d.month) || 0)
  .attr('y', d => y(d.category) || 0)
  .attr('width', x.bandwidth())
  .attr('height', y.bandwidth())
  .style('fill', d => color(d.deaths))
  .on('mouseover', function (event, d) {
    d3.select(this).style('stroke', '#333').style('stroke-width', '1.5px');

    d3.select('.heatmap-tooltip')
      .style('opacity', 1)
      .html(`<strong>${d.category}</strong><br/>${d.month} : ${d.deaths} attaque(s)`)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px');
  })
  .on('mousemove', function (event) {
    d3.select('.heatmap-tooltip')
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px');
  })
  .on('mouseout', function () {
    d3.select(this).style('stroke', 'none');
    d3.select('.heatmap-tooltip').style('opacity', 0);
  });

  }
}