'use strict';

var moment = require('moment');
const rewire = require('rewire');

describe('shelly_pvoutput', function () {
  Shelly = jasmine.createSpyObj('Shelly', ['call', 'getCurrentScriptId', 'getComponentStatus']);
  Shelly.getCurrentScriptId.and.returnValue(3);
  Timer = jasmine.createSpyObj('Timer', ['set']);
  const ShellyPvOutput = rewire('../shelly_pvoutput.js');

  it('initialize', function () {
    expect(Shelly.call).toHaveBeenCalledWith("KVS.Get", { key: 'script:3:PVOutput-http-headers' }, jasmine.any(Function));
    expect(Timer.set).toHaveBeenCalledWith(300000, true, jasmine.any(Function));
  });

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
  });

  it('pushStatus', function () {
    const sysStatus = { unixtime: 1677306480, time: "07:28" };
    const switchStatus = { aenergy: { total: 157.8 }, apower: 489.7 };
    Shelly.getComponentStatus.withArgs("sys").and.returnValue(sysStatus).withArgs("switch:0").and.returnValue(switchStatus).and.stub();
    expect(Timer.set).toHaveBeenCalledWith(jasmine.any(Number), true, jasmine.any(Function));
    const timerCallback = Timer.set.calls.mostRecent().args[2];
    timerCallback();
    expect(Shelly.call).toHaveBeenCalledWith("HTTP.Request", jasmine.any(Object), jasmine.any(Function));
    const param = Shelly.call.calls.mostRecent().args[1];
    expect(param.body).toContain('d=20230225');
    expect(param.body).toContain('t=07:28');
    expect(param.body).toContain('v1=157.8');
    expect(param.body).toContain('v2=489.7');
    expect(param.body).toContain('c1=1');
  });
});