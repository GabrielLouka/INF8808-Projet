import { Component } from '@angular/core';
import { DataViz1Component } from '../../components/data-viz1/data-viz1.component';
import { IntroductionSectionComponent } from "../../components/introduction-section/introduction-section.component";

@Component({
    selector: 'app-home-page',
    imports: [DataViz1Component, IntroductionSectionComponent],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
