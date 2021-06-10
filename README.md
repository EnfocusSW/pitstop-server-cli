# PitStop Server CLI

All code samples are in TypeScript.

The purpose of this package is to make it easier to work with the CLI version of
Enfocus PitStop Server by providing a PitStopServer class with a set of methods. There is also a PitStopServerOptions interface that ensures the correct usage of the options in a TypeScript setup.

Installation:

```javascript
npm i pitstop-server-cli
```

There is no need to install the types separately.

```javascript
import { PitStopServer } from "pitstop-server-cli";

let psOptions: PitStopServerOptions = {
  inputPDF: "/path/to/input.pdf",
  actionLists: ["/path/to/My Action List 1.eal", "/path/to/My Action List 2.eal"],
  preflightProfile: "/path/to/My Preflight Profile.ppp",
  outputFolder: "/path/to/the/output/folder/where/all/output/is/created",
  xmlReport: true,
  pdfReport: true,
  taskReport: false,
};

let ps: PitStopServer;
try {
  ps = new PitStopServer(psOptions);
  let result = await ps.run();
  console.log(result);
  console.log(ps.debugMessages);
} catch (error) {
  console.log(ps.debugMessages);
  console.error(error);
}
```

All output files (the processed PDF and the reports), but also the files needed for processing (the configuration file, the variable set), are written to the output folder. It is up to the user of the package to remove those files if they are not required anymore.

The name of the processed PDF is the same as the name of the input PDF. The name of the PDF report has the \_report suffix attached to the name. The name of the XML report is the same as that of the input PDF, but obviously with the extension XML. The names of the other files are fixed:

- config.xml
- variableset.evs (if requested)
- taskreport.xml (if requested)

## Advanced options

When the path to the PitStop Server CLI application is known, e.g. because it
was cached, it can be specified in the options object. This saves the time to locate the application for every run.

```javascript
psOptions.applicationPath = "/path/to/pitstop/server/cli";
```

When a variable set is needed it can be based on a fixed file that is specified as part of the options:

```javascript
psOptions.variableSet = "/path/to/the/variable/set/variableset.evs";
```

or if the file is just a template and it needs modification this can be done like this.

```javascript
example to be inserted
```

It is also possible to let the package create a variable set from scratch (and this is certainly the easiest approach):

```javascript
let ps: PitStopServer;
let variableSetValues = [
  { variable: "var1", type: "String", value: "this is for text variables" },
  { variable: "var2", type: "Number", value: 42 },
  { variable: "var3", type: "Length", value: 42 },
  { variable: "var4", type: "Boolean", value: true },
];
try {
  ps = new PitStopServer(psOptions);
  ps.createVariableSet(variableSetValues);
  let result = await ps.run();
  console.log(result);
  console.log(ps.debugMessages);
} catch (error) {
  console.log(ps.debugMessages);
  console.error(error);
}
```

There is no check upfront to see if the Preflight Profile and/or Action Lists actually use the variables. If there is misconfiguration
it may lead to PitStop Server generating an error and that will be available in the result variable. Specifying variables in the variable set that are not used
does not lead to an error, it is just that the processed file may not look as expected.

## Static methods

- getVersion(): returns the version number of the application in this form:
  Enfocus PitStop Server CLI 20 Beta 2 Build 1112118 (64bit)
  This method sets the static variable applicationPath.
- getApplicationPath(): returns the path to the application and sets the static variable applicationPath. On Windows this path is taken from the registry, on Mac it is searched in the Applications folder.

## Static variables

- applicationPath: this variable is cached for the lifetime of the script but it a good idea to cache it somewhere else (e.g. in global data in the context of Enfocus Switch) in order to avoid the application path is calculated for every file that is processed.

## Public methods

- run()
- updateVariableSet(options)
- createVariableSet(options)
- cleanup(): it is strongly advised to use this method at the end to avoid dangling temporary files that in the long run could fill up the disk.
