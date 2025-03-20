import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { getAttacks } from '../../data-proc/data-processing';

@Component({
    selector: 'app-data-viz1',
    imports: [],
    templateUrl: './data-viz1.component.html',
    styleUrl: './data-viz1.component.scss',
})
export class DataViz1Component implements OnInit {
    constructor(private dataService: DataService) {}

    ngOnInit(): void {
        this.dataService.data$.subscribe((data) => {
            if (data) {
                // console.log('Data received:', data);
                //this.createStackedAreaChart(data);
            } else {
                // TODO Afficher un message de chargement
                // console.log('Data is still loading...');
            }
        });

        getAttacks('data/data_filtered.csv').then((processedData) => {
            // console.log('Processed data:', processedData);
        });
    }
}
