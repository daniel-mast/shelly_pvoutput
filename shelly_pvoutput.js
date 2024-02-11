let CONFIG = {
  KVS_KEY_PVOUTPUT_HEADERS: "script:" + JSON.stringify(Shelly.getCurrentScriptId()) + ":PVOutput-http-headers",
  url: "https://pvoutput.org/service/r2/addstatus.jsp",
  httpHeaders: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
};

function pushStatus() {
  let sysStatus = Shelly.getComponentStatus("sys");
  let switchStatus = Shelly.getComponentStatus("switch:0");
  let isoDate = new Date(sysStatus.unixtime * 1000).toISOString();
  let body = "d=" + isoDate.substring(0, 4) + isoDate.substring(5, 7) + isoDate.substring(8, 10)
    + "&t=" + sysStatus.time
    + "&v1=" + JSON.stringify(switchStatus.aenergy.total)
    + "&v2=" + JSON.stringify(switchStatus.apower)
    + "&c1=1";
  Shelly.call("HTTP.Request",
    { method: "POST", url: CONFIG.url, headers: CONFIG.httpHeaders, body: body },
    function (result, error_code, error_message) {
      print(JSON.stringify(result), error_code, error_message);
    }
  );
}

function loadConfiguration() {
  Shelly.call("KVS.Get",
    { key: CONFIG.KVS_KEY_PVOUTPUT_HEADERS },
    function (result, error_code) {
      if (error_code === 0) {
        for (let prop in result.value) {
          CONFIG.httpHeaders[prop] = result.value[prop];
        }
      }
    }
  );
}

function setConfiguration(apikey, systemId) {
  Shelly.call("KVS.Set",
    { key: CONFIG.KVS_KEY_PVOUTPUT_HEADERS, value: { "X-Pvoutput-Apikey": apikey, "X-Pvoutput-SystemId": systemId } },
    loadConfiguration
  );
}

loadConfiguration();
Timer.set(300000, true, pushStatus);