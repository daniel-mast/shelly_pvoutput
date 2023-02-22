'use strict';

var moment = require('moment');
const rewire = require('rewire');

describe('shelly_pvoutput', function () {
  Shelly = jasmine.createSpyObj('Shelly', ['call', 'getCurrentScriptId']);
  Shelly.getCurrentScriptId.and.returnValue(3);
  Timer = jasmine.createSpyObj('Timer', ['set']);
  const ShellyPvOutput = rewire('../shelly_pvoutput.js');

  it('initialize', function () {
    expect(Shelly.call).toHaveBeenCalledWith("KVS.Get", { key: 'script:3:PVOutput-http-headers' }, jasmine.any(Function));
    expect(Timer.set).toHaveBeenCalledWith(300000, true, jasmine.any(Function));
  });

  it('dateString', function () {
    const dateString = ShellyPvOutput.__get__('dateString');
    expect(dateString(1672527600)).toBe('20230101');
    expect(dateString(Date.now() / 1000)).toBe(moment(Date.now()).format('YYYYMMDD'));
  })

  it('setConfiguration', function () {
    const CONFIG = ShellyPvOutput.__get__('CONFIG');
    const setConfiguration = ShellyPvOutput.__get__('setConfiguration');
    setConfiguration("0123456789abcdef", "12345");
    expect(Shelly.call).toHaveBeenCalledWith("KVS.Set",
      { key: CONFIG.KVS_KEY_PVOUTPUT_HEADERS, value: { "X-Pvoutput-Apikey": "0123456789abcdef", "X-Pvoutput-SystemId": "12345" } },
      jasmine.any(Function));
  })

  it('loadConfiguration', function () {
    const configValue = { "X-Pvoutput-Apikey": "apikey", "X-Pvoutput-SystemId": "systemId" };

    const CONFIG = ShellyPvOutput.__get__('CONFIG');
    Shelly.call.withArgs("KVS.Get", { key: CONFIG.KVS_KEY_PVOUTPUT_HEADERS }, jasmine.any(Function)).and.callFake(
      function (_method, _params, callback, _userdata) {
        callback({ value: configValue }, 0);
      }
    ).and.stub();
    const loadConfiguration = ShellyPvOutput.__get__('loadConfiguration');
    loadConfiguration();
    expect(Shelly.call).toHaveBeenCalledWith("KVS.Get", { key: CONFIG.KVS_KEY_PVOUTPUT_HEADERS }, jasmine.any(Function));

    expect(CONFIG.httpHeaders["X-Pvoutput-Apikey"]).toBe("apikey");
    expect(CONFIG.httpHeaders["X-Pvoutput-SystemId"]).toBe("systemId");
  })
});