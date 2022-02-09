import { Component, OnInit } from '@angular/core';
import { User, Demographic } from './data-interfaces';
import { HttpClient } from '@angular/common/http';
import * as Highcharts from 'highcharts';
import * as _ from 'lodash';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public currentUser: User;
  public otherUsers: User[];

  private chartRef;
  private demographics: Demographic[];
  public updateFlag: boolean = false;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Demographics',
    },
    series: [],
  };

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartRef = chart;
  };

  constructor(private httpClient: HttpClient) {}

  public ngOnInit() {
    this.loadUserData();
    this.loadDemographicsData();
  }

  public onHover(event, u: User) {
    if (u.phone.length !== 10) {
      event.currentTarget.style.background = 'LightCoral';
    }
  }

  onHoverExit(event, u: User) {
    event.currentTarget.style.background = 'white';
  }

  private loadUserData() {
    this.httpClient.get('assets/userdata.json').subscribe((users) => {
      this.currentUser = users[0];
      this.otherUsers = [users[1], users[2]];
    });
  }

  public getFormattedUserPhoneNumber(phone: string): string {
    if (!phone || phone.trim() === '') {
      return '';
    }
    let formatted: string;
    formatted = '(' + phone.substring(0, 3) + ') ';
    formatted = formatted + phone.substring(3, 6) + '-';
    formatted = formatted + phone.substring(6, 10);
    return formatted;
  }

  private loadDemographicsData() {
    this.httpClient.get('assets/demographicsdata.json').subscribe((demo) => {
      this.demographics = demo as Demographic[];
      this.initializeChartData();
    });
  }

  //  Array utility method that zips together 2 equal sized arrays
  private static arrayZip = (a, b) => a.map((k, i) => [k, b[i]]);

  private initializeChartData() {
    const cityGroups = _.groupBy(this.demographics, 'city');
    Object.keys(cityGroups).forEach((city) => {
      const citySeries = {
        type: 'line',
        name: city,
        data: AppComponent.arrayZip(
          cityGroups[city].map((d) => d.year),
          cityGroups[city].map((d) => d.population)
        ),
      };
      console.log(citySeries);
      this.chartRef.addSeries(citySeries);
    });
    this.updateFlag = true;
  }
}
