import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import '../../assets/countdown/js/demo.js';

declare var demo: any;

@Component({
  selector: 'my-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})

export class CountdownComponent {

  @Input() units: any = 'Days | Hours | Minutes | Seconds';
  @Input() end: '2018-09-14';
  @Input() displayString: String = '';
  @Input() text: any;
  @Input() divider: any;
  @Input() showZero: Boolean = false;
  @Output() reached: EventEmitter<Date> = new EventEmitter();
  display: any = [];
  displayNumbers: any = [];
  wasReached: Boolean = false;


  constructor() {
    setInterval(() => this._displayString(), 100);
   }



  _displayString() {

    if (this.wasReached)
      return;

    if (typeof this.units === 'string') {
      this.units = this.units.split('|');
    }

    let givenDate: any = new Date('2018-09-14');
    let now: any = new Date();
    let dateDifference: any = givenDate - now;

    console.log(givenDate);
    if ((dateDifference < 100 && dateDifference > 0) || dateDifference < 0 && !this.wasReached) {
      this.wasReached = true;
      this.reached.next(now);
    }

    let lastUnit = this.units[this.units.length - 1],
    unitConstantForMillisecs = {
        year: (((1000 * 60 * 60 * 24 * 7) * 4) * 12),
        month: ((1000 * 60 * 60 * 24 * 7) * 4),
        weeks: (1000 * 60 * 60 * 24 * 7),
        days: (1000 * 60 * 60 * 24),
        hours: (1000 * 60 * 60),
        minutes: (1000 * 60),
        seconds: 1000,
      },
      unitsLeft = {},
      returnText = '',
      returnNumbers = '',
      totalMillisecsLeft = dateDifference,
      i,
      unit: any;

    for (i in this.units) {
      if (this.units.hasOwnProperty(i)) {

        unit = this.units[i].trim();
        if (unitConstantForMillisecs[unit.toLowerCase()] === false) {
          //$interval.cancel(countDownInterval);
          throw new Error('Cannot repeat unit: ' + unit);

        }
        if (unitConstantForMillisecs.hasOwnProperty(unit.toLowerCase()) === false) {
          throw new Error('Unit: ' + unit + ' is not supported. Please use following units: year, month, weeks, days, hours, minutes, seconds, milliseconds');
        }

        // If it was reached, everything is zero#

        unitsLeft[unit] = (this.wasReached) ? 0 : totalMillisecsLeft / unitConstantForMillisecs[unit.toLowerCase()];

        if (lastUnit === unit) {
          unitsLeft[unit] = Math.ceil(unitsLeft[unit]);
        } else {
          unitsLeft[unit] = Math.floor(unitsLeft[unit]);
        }

        totalMillisecsLeft -= unitsLeft[unit] * unitConstantForMillisecs[unit.toLowerCase()];
        unitConstantForMillisecs[unit.toLowerCase()] = false;

        // If it's less than 0, round to 0
        unitsLeft[unit] = (unitsLeft[unit] > 0) ? unitsLeft[unit] : 0;

        returnNumbers += ' ' + unitsLeft[unit] + ' | ';
        returnText += ' ' + unit;
      }
    }
    console.log(returnNumbers);


    if (this.text === null || !this.text) {
      this.text = {
        Days: 'Tage',
        Hours: 'Stunden',
        Minutes: 'Minuten',
        Seconds: 'Sekunden',
      };
    }

    this.displayString = returnText
      .replace('Days', this.text.Days + ' | ')
      .replace('Hours', this.text.Hours + ' | ')
      .replace('Minutes', this.text.Minutes + ' | ')
      .replace('Seconds', this.text.Seconds);

    this.displayNumbers = returnNumbers.split('|');
    this.display = this.displayString.split('|');
  }

}