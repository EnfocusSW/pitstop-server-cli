# PitStop Server CLI

The purpose of this package is to make it easier to work with the CLI version of
Enfocus PitStop Server by providing a PitStopServer class with a set of methods. A first obvious use case for this package is to use it for developing scripts or apps that are used in Enfocus Switch. However, the package can equally well be used in other environments like for example in the backend of a NodeJS-based website where uploaded PDF files are being preflighted.

PitStop Server has to be installed and licensed prior to the use of this package.

There are also two interfaces that ensure the correct usage of the options in a TypeScript setup:

- PitStopServerOptions
- VariableSetOptions

All code samples are in TypeScript.

## Inputs and outputs

The package takes a PDF and a set of options as input.

The output is gathered in an output folder and consists of not only the "normal" output files (the processed PDF and the reports), but also of the files needed for processing (the configuration file, the variable set). It is up to the user of the package to remove any files that are not required anymore after processing.

The default output names are documented below.

## Installation:

```javascript
npm i @enfocussw/pitstop-server-cli
```

There is no need to install the typings separately.

## Instance construction

```javascript
let psOptions: PitStopServerOptions = {
  inputPDF: "/path/to/input.pdf",
  actionLists: ["/path/to/My Action List 1.eal", "/path/to/My Action List 2.eal"],
  preflightProfile: "/path/to/My Preflight Profile.ppp",
  outputFolder: "/path/to/the/output/folder/where/all/output/is/created",
};
let ps = new PitStopServer(psOptions);
```

This is the complete list of options that can be configured when instantiating the PitStopServer class:

| Option           | Type                                        | Mandatory | Description                                                                                     |
| ---------------- | ------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| inputPDF         | string                                      | yes       | The path to the input file                                                                      |
| outputFolder     | string                                      | yes       | The path to the output folder where all output will be saved to                                 |
| outputPDFName    | string                                      | no        | Default: the name of the input PDF                                                              |
| preflightProfile | string                                      | no\*      | The path to the Preflight Profile                                                               |
| actionLists      | string[]                                    | no\*      | An array of paths to the Action Lists                                                           |
| variableSet      | string                                      | no        | The path to a template Variable Set                                                             |
| variableSetName  | string                                      | no        | The name of the final Variable Set file. Default: variableset.evs                               |
| pdfReport        | boolean                                     | no        | Should a PDF report be created? Default: false                                                  |
| pdfReportName    | string                                      | no        | Default: the input name with \_report as a suffix                                               |
| xmlReport        | boolean                                     | no        | Should an XML report be created? Default: false                                                 |
| xmlReportName    | string                                      | no        | Default: the name of the input PDF with the extension xml                                       |
| taskReport       | boolean                                     | no        | Should a task report XML be created? Default: false                                             |
| taskReportName   | string                                      | no        | Default: taskreport.xml                                                                         |
| configFile       | string                                      | no        | The path to a template configuration file. If not defined a basic file is created on the fly    |
| configFileName   | string                                      | no        | Default: config.xml                                                                             |
| applicationPath  | string                                      | no        | The path to where the CLI application is stored. If not defined, the package will search for it |
| measurementUnit  | "Millimeter", "Centimeter", "Inch", "Point" | no        | Default: Millimeter                                                                             |
| language         | string                                      | no        | Default: enUS                                                                                   |

\*The preflightProfile and actionLists options are both optional, but when both are missing an error will be thrown.

An error is also thrown when

- the output folder does not exist or is not writable
- one of the Action Lists does not exist
- the Preflight Profile does not exist

For the language, use the 4-letter abbreviation, e.g. enUS, frFR, jaJP, itIT, etc. and of course only for a language that is supported by PitStop Server. Check the documentation for a complete list.

## Static methods

- getVersion()

Returns the version number of the application in this form:

```javascript
Enfocus PitStop Server CLI 21.0.1.0 Build 1253122 (64bit)
```

- getApplicationPath()

Returns the path to the application and sets the static variable applicationPath. On Windows this path is taken from the registry, on Mac it is searched in the Applications folder.

## Instance methods

- updateVariableSet(options)

This method only makes sense when a template Variable Set was defined when constructing the instance. The options are defined like this:

```javascript
let variableSetValues: VariableSetOptions = [
  { variable: "var1", type: "String", value: "this is for text variables" },
  { variable: "var2", type: "Number", value: 42 },
  { variable: "var3", type: "Length", value: 666 },
  { variable: "var4", type: "Boolean", value: true },
];
```

The values of variables of the type Length must be in the unit defined by the measurementUnit option when constructing an instance.

Using a template Variable Set is needed when conditional variables are being used.

- createVariableSet(options)

This method uses the same options as the updateVariableSet method. The Variable Set is created on the fly. It does not support the creation of Variable Sets that use conditions, but in many cases that will not be necessary as the script that uses this package is probably capable of precalculating all the variable values.

Both these methods should be used before the run method. There is no check upfront to see if the Preflight Profile and/or Action Lists actually use the variables. If one of the Action List or the Preflight Profile expects a certain variable that is not defined in the Variable Set PitStop Server will generate an error that will be available in the result variable returned by the run() method. Variables in the Variable Set that are not used in any of the Action Lists or in the Preflight Profile are silently ignored. Consider this when you do not see any errors, but the output is not as expected.

- run()

This method creates a configuration file that defines all the settings for PitStop Server and launches it. This is done using the package execa. The result object of execa is returned and contains the following interesting fields:

```javascript
{
  command: 'the string of the entire command',
  exitCode: 0,
  stdout: 'whatever was written to stdout (probably nothing)',
  stderr: 'the error message when an error occurred',
}
```

A successful execution results in an exitCode with the value 0. If the exitCode is not 0 there will be a message in stderr. Note that no error is thrown in such a case! It is up to you to check the exit code. An error is only thrown when there is a problem running execa.

- cleanup()

This method removes the output folder and all its contents. Certainly in a Switch environment the output folder is a temporary folder. The files that are sent to the output connections or that are attached as datasets are taken from the output folder, but they are not removed so it is up to the script writer or app creator to do that. Neglecting to do so may fill up the disk in the long run. Outside of Switch it is up to the user of this package to decide whether this method should be used after processing or not.

## Static properties

- applicationPath

This variable is cached for the lifetime of the script but it is a good idea to cache it somewhere else (e.g. in global data in the context of Enfocus Switch) and to specify the application path in the PitStopServerOptions when constructing a PitStopServer instance, this in order to avoid the application path being calculated for every file that is processed.

## Instance properties

- debugMessages

The package creates an array of debug messages. It can be useful during the development of a script to log these messages after the run() method.

- executionTime

The time it took in milliseconds to run PitStop Server.

## Sample script

```javascript
import { PitStopServer, PitStopServerOptions, VariableSetOptions } from "@enfocussw/pitstop-server-cli";

async function main() {
  let psOptions: PitStopServerOptions = {
    inputPDF: "/path/to/input.pdf",
    actionLists: ["/path/to/My Action List 1.eal", "/path/to/My Action List 2.eal"],
    preflightProfile: "/path/to/My Preflight Profile.ppp",
    outputFolder: "/path/to/the/output/folder/where/all/output/is/created",
    xmlReport: true,
    pdfReport: true,
    pdfReportName: "report.pdf",
    taskReport: false,
  };

  let variableSetValues: VariableSetOptions = [
    { variable: "var1", type: "String", value: "this is for text variables" },
    { variable: "var2", type: "Number", value: 42 },
    { variable: "var3", type: "Length", value: 666 },
    { variable: "var4", type: "Boolean", value: true },
  ];

  let ps: PitStopServer;
  try {
    ps = new PitStopServer(psOptions);
    await ps.createVariableSet(variableSetValues);
    let result = await ps.run();
    console.log(result);
    console.log(ps.debugMessages);
    console.log("Execution time: " + ps.executionTime);
    if (result.exitCode !== 0) {
      console.error(result.stderr);
    } else {
    }
  } catch (error) {
    console.error(error.message);
  }
}

main();
```

On the [EnfocusSW GitHub](https://github.com/EnfocusSW) there is an example script, [PitStopServerAddText](https://github.com/EnfocusSW/PitStopServerAddText), that shows the use of this package in an Enfocus Switch environment.
