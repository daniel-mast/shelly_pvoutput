let UNIXTIMESTAMP2DATE = {
  "2023": [1672527600, 1675206000, 1677625200, 1680300000, 1682892000, 1685570400, 1688162400, 1690840800, 1693519200, 1696111200, 1698793200, 1701385200]
};

let CONFIG = {
  KVS_KEY_PVOUTPUT_HEADERS: "script:" + JSON.stringify(Shelly.getCurrentScriptId()) + ":PVOutput-http-headers",
  url: "https://pvoutput.org/service/r2/addstatus.jsp",
  httpHeaders: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
};

function dateString(unixtime) {
  for (let year in UNIXTIMESTAMP2DATE) {
    for (let month = UNIXTIMESTAMP2DATE[year].length - 1; month >= 0; month--) {
      if (UNIXTIMESTAMP2DATE[year][month] <= unixtime) {
        let day = Math.floor((unixtime - UNIXTIMESTAMP2DATE[year][month]) / (24 * 3600)) + 1;
        if (month < 9 && day < 10) {
          return year + '0' + JSON.stringify(month + 1) + '0' + JSON.stringify(day);
        }
        else if (month < 9) {
          return year + '0' + JSON.stringify(month + 1) + JSON.stringify(day);
        }
        if (day < 10) {
          return year + JSON.stringify(month + 1) + '0' + JSON.stringify(day);
        }
        return year + JSON.stringify(month + 1) + JSON.stringify(day);
      }
    }
  }
}

function pushStatus() {
  let sysStatus = Shelly.getComponentStatus("sys");
  let switchStatus = Shelly.getComponentStatus("switch:0");

  let body = "d=" + dateString(sysStatus.unixtime) + "&t=" + sysStatus.time
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