'use strict';

const rewire = require('rewire');

describe('shelly_pvoutput', function() {
  Shelly = jasmine.createSpyObj('Shelly', ['call']);
  const ShellyPvOutput = rewire('../shelly_pvoutput.js');

  it('initialize', function() {
  });
});