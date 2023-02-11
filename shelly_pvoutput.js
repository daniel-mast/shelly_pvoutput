let UNIXTIMESTAMP2DATE = {
  "2023": [1672527600, 1675206000, 1677625200, 1680300000, 1682892000, 1685570400, 1688162400, 1690840800, 1693519200, 1696111200, 1698793200, 1701385200]
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