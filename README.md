#PitStop Server CLI

```javascript
const { PitStopServer } = require("./pitstop-server-cli.js");

let psOptions = {};
psOptions.inputPDF = "/path/to/input.pdf";
psOptions.actionLists = ["/path/to/My Action List 1.eal", "/path/to/My Action List 2.eal"];
psOptions.preflightProfile = "/path/to/My Preflight Profile.ppp";
psOptions.outputFolder = "/path/to/the/output/folder/where/all/output/is/created";
psOptions.xmlReport = true;
psOptions.pdfReport = true;

try {
  let ps = new PitStopServer(psOptions);
  let result = await ps.run();
  console.log(result);
  console.log(ps.debugMessages);
} catch (error) {
  console.error(error);
}
```

Advanced options

```javascript
psOptions.applicationPath = "/path/to/pitstop/server/cli";
```

Static methods
getVersion()
Returns the version number of the application in this form:
Enfocus PitStop Server CLI 20 Beta 2 Build 1112118 (64bit)
This method sets the static variable applicationPath.

getApplicationPath()
Returns the path to the application and sets the static variable applicationPath.

cleanup()
Should ALWAYS be run at the end to avoid dangling temporary files that in the long run could fill up the disk.

Static variables
applicationPath
This variable is cached for the lifetime of the script.

Public methods
run()
updateVariableSet(options)

Constructor method
