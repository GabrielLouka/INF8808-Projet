import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { HeatmapCell, MonthEntry } from '../../../models/data';
import { DataService } from '../../../services/data/data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-data-viz2',
    imports: [MatProgressSpinnerModule, CommonModule],
    templateUrl: './data-viz2.component.html',
    styleUrl: './data-viz2.component.scss',
    standalone: true
})
export class DataViz2Component implements OnInit {
  isLoading = true;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
  
  }

  
}

