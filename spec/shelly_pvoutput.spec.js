'use strict';

var moment = require('moment');
const rewire = require('rewire');

describe('shelly_pvoutput', function() {
  Shelly = jasmine.createSpyObj('Shelly', ['call']);
  const ShellyPvOutput = rewire('../shelly_pvoutput.js');

  it('initialize', function() {
  });
  
  it('dateString', function() {
    const dateString = ShellyPvOutput.__get__('dateString');
    expect(dateString(1672527600)).toBe('20230101');
    expect(dateString(Date.now() / 1000)).toBe(moment(Date.now()).format('YYYYMMDD'));
  })
});