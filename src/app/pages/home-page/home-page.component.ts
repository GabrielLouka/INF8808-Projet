import { Component } from '@angular/core';
import { IntroductionSectionComponent } from '../../components/introduction-section/introduction-section.component';
import { DataViz1Component } from '../../components/visualizations/data-viz1/data-viz1.component';
import { DataViz2Component } from '../../components/visualizations/data-viz2/data-viz2.component';
import { DataViz3Component } from '../../components/visualizations/data-viz3/data-viz3.component';
import { DataViz4Component } from '../../components/visualizations/data-viz4/data-viz4.component';

@Component({
    selector: 'app-home-page',
    imports: [
        IntroductionSectionComponent,
        DataViz1Component,
        DataViz2Component,
        DataViz3Component,
        DataViz4Component,
    ],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
