import * as fs from "fs";
import { DOMParser } from "xmldom";
import * as xpath from "xpath";
import * as execa from "execa";
import * as registry from "registry-js";
import * as os from "os";
import * as tmp from "tmp";
import * as _ from "lodash";
import * as rimraf from "rimraf";

export class PitStopServer {
  static applicationPath: string;
  static currentInstance: PitStopServer;
  private configFile: string;
  private finalConfigFile: string;
  private inputPDF: string;
  private outputFolder: string;
  private preflightProfile: string;
  private actionLists: string[];
  private variableSet: string;
  private finalVariableSet: string;
  private pdfReport: boolean;
  private xmlReport: boolean;
  public debugMessages: string[];

  //////////////////////////////////////////////////////////////////////////
  //
  // Constructor
  //
  //////////////////////////////////////////////////////////////////////////
  /**
   * Constructs a PitStopServer instance
   * @param options
   */
  public constructor(options: {
    inputPDF: string;
    outputFolder: string;
    preflightProfile?: string;
    actionLists?: string[];
    variableSet?: string;
    pdfReport?: boolean;
    xmlReport?: boolean;
    configFile?: string;
    applicationPath?: string;
  }) {
    //check the presence of the mandatory options
    if (options.inputPDF == undefined || options.outputFolder == undefined) {
      throw new Error("The mandatory options for running PitStop Server were not correctly defined");
    }
    if (options.actionLists == undefined && options.preflightProfile == undefined) {
      throw new Error("There was neither a Preflight Profile nor any Action Lists defined for running PitStop Server");
    }

    //initialize the instance variables with the values of the options
    for (let option in options) {
      if (option == "applicationPath") {
        PitStopServer.applicationPath = options.applicationPath;
      } else {
        let declaration = "this." + option + "='" + options[option] + "'";
        console.log(declaration);
        eval(declaration);
      }
    }
    this.debugMessages = [];

    //check if the output folder exists and is writable
    if (fs.existsSync(this.outputFolder) == false) {
      throw new Error("The output folder " + options.outputFolder + " does not exist");
    } else {
      try {
        fs.accessSync(this.outputFolder, fs.constants.W_OK);
      } catch (error) {
        throw new Error("The output folder " + options.outputFolder + " is not writable");
      }
    }

    //check if the specified path to the cli exists or find it
    if (PitStopServer.applicationPath !== undefined) {
      if (fs.existsSync(PitStopServer.applicationPath) == false) {
        throw new Error("The path to the CLI does not exist (" + PitStopServer.applicationPath + ")");
      }
    } else {
      try {
        PitStopServer.getApplicationPath();
      } catch (error) {
        throw error;
      }
    }

    //create a basic config file if needed
    this.finalConfigFile = this.outputFolder + "/config.xml";
    if (options.configFile == undefined) {
      this.createBasicConfigFile();
    } else {
      this.debugMessages.push("Using provided configuration file " + options.configFile);
      if (fs.existsSync(this.configFile) == false) {
        throw new Error("The configuration file " + this.configFile + " does not exist");
      } else {
        fs.copyFileSync(this.configFile, this.finalConfigFile);
      }
    }

    //add the input file, output folder and the profile and action lists, and the variable set to the config file
    try {
      this.updateConfigFile(options);
    } catch (error) {
      throw error;
    }

    //save the current instance for cleaning up in a static method
    PitStopServer.currentInstance = this;
  }

  //////////////////////////////////////////////////////////////////////////
  //
  // PitStopServer static API methods
  //
  //////////////////////////////////////////////////////////////////////////
  /**
   * Static method returning the version number of PitStop Server
   * @returns string
   */
  public static getVersion = async () => {
    //get the application path of PitStop Server
    if (PitStopServer.applicationPath == undefined) {
      try {
        console.log("getting the application path");
        PitStopServer.getApplicationPath();
      } catch (error) {
        throw error;
      }
    }
    let execResult;
    try {
      execResult = await execa(PitStopServer.applicationPath, ["-version"]);
      return execResult.stdout;
    } catch (error) {
      throw error;
    }
  };
  /**
   * Static function to get the path of the CLI application of PitStop Server
   * @returns string
   */
  public static getApplicationPath = () => {
    if (PitStopServer.applicationPath !== undefined) {
      return PitStopServer.applicationPath;
    }
    if (os.platform().startsWith("win") == true) {
      //access the registry to find the path to PitStop Server
      try {
        PitStopServer.applicationPath = PitStopServer.findPitStopServerInRegistry();
      } catch (error) {
        throw error;
      }
      return PitStopServer.applicationPath;
    } else {
      //locate PitStop Server in the OSX Applications folder; the name of this folder is only localized in the Finder so it is /Applications regardless of the system language
      let enfocusDir = "/Applications/Enfocus";
      let psPath = "";
      try {
        let enfocusList = fs.readdirSync(enfocusDir);
        for (let i = 0; i < enfocusList.length; i++) {
          if (enfocusList[i].startsWith("Enfocus PitStop Server") == true) {
            psPath = enfocusDir + "/" + enfocusList[i];
          }
        }
        if (psPath == "") {
          throw new Error("Could not find the Enfocus PitStopServerCLI symbolic link in " + enfocusDir);
        }
      } catch (error) {
        throw error;
      }
      try {
        PitStopServer.applicationPath = fs.realpathSync(psPath + "/PitStopServerCLI");
      } catch (error) {
        throw error;
      }
    }
    return PitStopServer.applicationPath;
  };

  /**
   * Static method to clean up the output folder of the current instance
   */
  public static cleanup = () => {
    try {
      rimraf.sync(PitStopServer.currentInstance.outputFolder);
    } catch (error) {
      //no need to throw an error when this method fails
    }
  };

  /**
   * Private static method to find the path to the PitStop Server CLI application in the Windows registry
   * @returns string
   */
  private static findPitStopServerInRegistry = () => {
    let values;
    try {
      values = registry.enumerateValues(
        registry.HKEY.HKEY_LOCAL_MACHINE,
        "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\PitStop Server.exe"
      );
    } catch (error) {
      throw error;
    }
    let applicationPath = "";
    for (let i = 0; i < values.length; i++) {
      if ((values[i].name = "Path")) {
        applicationPath = values[i].data;
      }
    }
    if (applicationPath == "") {
      throw new Error("No key found with the name Path under PitStop Server.exe in the registry");
    } else {
      return applicationPath + "\\PitStopServerCLI.exe";
    }
  };

  //////////////////////////////////////////////////////////////////////////
  //
  // PitStopServer public instance methods
  //
  //////////////////////////////////////////////////////////////////////////
  run = async () => {
    //the return value is an object with the execution result
    this.debugMessages.push("CLI path: " + PitStopServer.applicationPath);
    this.debugMessages.push("PitStop Server start at " + new Date().toISOString());
    let execResult: object;
    try {
      execResult = await execa(PitStopServer.applicationPath, ["-config", this.finalConfigFile]);
      this.debugMessages.push("PitStop Server end at " + new Date().toISOString());
      return execResult;
    } catch (error) {
      throw error;
    }
  };

  updateVariableSet = (values: { variable: string; value: string | number | boolean }[]) => {
    if (this.finalVariableSet == undefined) {
      throw new Error("There is no Variable Set defined");
    }
    // Process the input variable set so it is filled with the correct values from the values that are specified
    this.debugMessages.push("Modifying the variable set file");
    let evs;
    try {
      let evsContent = fs.readFileSync(this.finalVariableSet).toString();
      let parser = new DOMParser({
        locator: {},
        errorHandler: {
          warning: (msg) => {
            //ignore
          },
          error: (msg) => {
            throw new Error(msg);
          },
          fatalError: (msg) => {
            throw new Error(msg);
          },
        },
      });
      evs = parser.parseFromString(evsContent);
    } catch (error) {
      throw error;
    }
    let select = xpath.useNamespaces({ evs: "http://www.enfocus.com/2012/EnfocusVariableSet" });

    //modify the EVS structure with the new values
    let node;
    let oldValue, newValue;
    let operatorID;
    let xpExpression: string;
    let resultType;
    let oldUnitNode, newUnitNode;
    let unitNodeParent, unitNodeText;
    for (let i = 0; i < values.length; i++) {
      xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:OperatorID";
      operatorID = select("string(" + xpExpression + ")", evs);
      if (operatorID == "") {
        throw new Error("The variable " + values[i].variable + " is not present in the variable set " + this.variableSet);
      }
      xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:ResultType";
      resultType = select("string(" + xpExpression + ")", evs);
      if (resultType == "Length") {
        xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:DefaultUnit";
        oldUnitNode = select(xpExpression, evs);
        unitNodeText = evs.createText("mm");
        if (oldUnitNode == undefined) {
          newUnitNode = evs.createElement("evs:DefaultUnit");
          newUnitNode.appendChild(unitNodeText);
          unitNodeParent = select("/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']", evs);
          unitNodeParent.appendChild(newUnitNode);
        } else {
          oldUnitNode.replaceChild(unitNodeText, oldUnitNode.getFirstChild());
        }
      }
      xpExpression = "/evs:VariableSet/evs:Operators/evs:Operator[evs:GUID='" + operatorID + "']/evs:OperatorData/evs:Value";
      node = select(xpExpression, evs);
      if (node.length == 0) {
        throw new Error("Error finding a value for variable " + values[i].variable + " in the variable set");
      } else {
        oldValue = select("evs:Value", evs);
        newValue = evs.createTextNode(values[i].value.toString());
        //node.replaceChild(newValue, node.getFirstChild());
        node[0].replaceChild(newValue, oldValue);
      }
    }
    try {
      fs.writeFileSync(this.finalVariableSet, evs.toString());
    } catch (err) {
      throw err;
    }
  };

  //////////////////////////////////////////////////////////////////////////
  //
  // PitStopServer private API methods
  //
  //////////////////////////////////////////////////////////////////////////
  private updateConfigFile = (options) => {
    //read the final XML config file into a DOM for modification
    //the final config file is either a basic one created by the class or
    //a copy of a config file provided by the calling instance
    this.debugMessages.push("Modifying the configuration file");
    let xml;
    try {
      let xmlContent = fs.readFileSync(this.finalConfigFile).toString();
      let parser = new DOMParser({
        locator: {},
        errorHandler: {
          warning: (msg) => {
            //ignore
          },
          error: (msg) => {
            throw new Error(msg);
          },
          fatalError: (msg) => {
            throw new Error(msg);
          },
        },
      });
      xml = parser.parseFromString(xmlContent);
    } catch (error) {
      throw error;
    }
    let select = xpath.useNamespaces({ cf: "http://www.enfocus.com/2011/PitStopServerCLI_Configuration.xsd" });
    let newElem, newText;

    //modify the config file
    try {
      //fill in the input file and the output file
      if (typeof options.inputPDF == "string") {
        if (fs.existsSync(options.inputPDF) == false) {
          throw new Error("The input PDF " + options.inputPDF + " does not exist");
        }
        let inputPathNode = select("//cf:InputPath", xml);
        newText = xml.createTextNode(options.inputPDF);
        (inputPathNode[0] as any).appendChild(newText);
      }

      if (typeof options.outputFolder == "string") {
        if (fs.existsSync(options.outputFolder) == false) {
          throw new Error("The output folder " + options.outputFolder + " does not exist");
        }
        let outputPathNode = select("//cf:OutputPath", xml);
        newText = xml.createTextNode(options.outputFolder + "/output.pdf");
        (outputPathNode[0] as any).appendChild(newText);
      }

      let mutatorsNode = select("//cf:Mutators", xml);
      //add the preflight profile
      if (typeof options.preflightProfile == "string") {
        if (fs.existsSync(options.preflightProfile) == false) {
          throw new Error("The Preflight Profile " + options.preflightProfile + " does not exist");
        }
        this.debugMessages.push("Adding preflight profile " + options.preflightProfile);
        newElem = xml.createElement("cf:PreflightProfile");
        newText = xml.createTextNode(options.preflightProfile);
        newElem.appendChild(newText);
        (mutatorsNode as any).appendChild(newElem);
      }

      //add the action lists
      if (options.actionLists !== undefined && options.actionLists.constructor == Array) {
        for (let i = 0; i < options.actionLists.length; i++) {
          if (fs.existsSync(options.actionLists[i]) == false) {
            throw new Error("The Action List " + options.actionLists[i] + " does not exist");
          }
          this.debugMessages.push("Adding action list " + options.actionLists[i]);
          newElem = xml.createElement("cf:ActionList");
          newText = xml.createTextNode(options.actionLists[i]);
          newElem.appendChild(newText);
          (mutatorsNode[0] as any).appendChild(newElem);
        }
      }

      //add the reports
      if (options.xmlReport == true) {
        this.debugMessages.push("Defining an XML report");
        let reportsNode = select("//cf:Reports", xml);
        let newElemReportXML = xml.createElement("cf:ReportXML");
        (reportsNode[0] as any).appendChild(newElemReportXML);
        let newElemReportPath = xml.createElement("cf:ReportPath");
        let newReportPathText = xml.createTextNode(options.outputFolder + "/report.xml");
        newElemReportPath.appendChild(newReportPathText);
        newElemReportXML.appendChild(newElemReportPath);
        let newElemVersion = xml.createElement("cf:Version");
        let newVersionText = xml.createTextNode("3");
        newElemVersion.appendChild(newVersionText);
        newElemReportXML.appendChild(newElemVersion);
        let newElemNrItems = xml.createElement("cf:MaxReportedNbItemsPerCategory");
        let newNrItemsText = xml.createTextNode("-1");
        newElemNrItems.appendChild(newNrItemsText);
        newElemReportXML.appendChild(newElemNrItems);
        let newElemNrOccurrences = xml.createElement("cf:MaxReportedNbOccurrencesPerItem");
        let newNrOccurrencesText = xml.createTextNode("-1");
        newElemNrOccurrences.appendChild(newNrOccurrencesText);
        newElemReportXML.appendChild(newElemNrOccurrences);
      }
      if (options.pdfReport == true) {
        this.debugMessages.push("Defining a PDF report");
        let reportsNode = select("//cf:Reports", xml);
        let newElemReportPDF = xml.createElement("cf:ReportPDF");
        (reportsNode[0] as any).appendChild(newElemReportPDF);
        let newElemReportPath = xml.createElement("cf:ReportPath");
        let newReportPathText = xml.createTextNode(options.outputFolder + "/report.pdf");
        newElemReportPath.appendChild(newReportPathText);
        newElemReportPDF.appendChild(newElemReportPath);
      }

      //add the variable set
      if (typeof options.variableSet == "string") {
        if (fs.existsSync(options.variableSet) == false) {
          throw new Error("The Variable Set " + options.variableSet + " does not exist");
        }
        this.finalVariableSet = this.outputFolder + "/variableset.evs";
        if (options.variableSet !== this.finalVariableSet) {
          this.debugMessages.push("Copying the variable set " + options.variableSet);
          fs.copyFileSync(options.variableSet, this.finalVariableSet);
        }
        this.debugMessages.push("Adding the variable set " + this.finalVariableSet);
        let processNode = select("//cf:Process", xml);
        let variableSetNode = select("cf:SmartPreflight/cf:VariableSet", processNode[0] as any);
        if (variableSetNode.length !== 0) {
          let oldValue = select("//cf:Process/cf:SmartPreflight/cf:VariableSet", xml);
          let newValue = xml.createTextNode(options.finalVariableSet);
          (variableSetNode[0] as any).replaceChild(newValue, oldValue);
        } else {
          let newElemSmartPreflight = xml.createElement("cf:SmartPreflight");
          (processNode[0] as any).appendChild(newElemSmartPreflight);
          let newElemVariableSet = xml.createElement("cf:VariableSet");
          let newVariableSetText = xml.createTextNode(this.finalVariableSet);
          newElemVariableSet.appendChild(newVariableSetText);
          newElemSmartPreflight.appendChild(newElemVariableSet);
        }
      }

      //save the modified config file to the output folder
      this.debugMessages.push("Saving the final configuration file " + this.finalConfigFile);
      fs.writeFileSync(this.finalConfigFile, xml.toString());
    } catch (error) {
      throw error;
    }
  };

  private createBasicConfigFile = () => {
    this.debugMessages.push("Creating a basic configuration file");
    let xmlString: string = `<?xml version="1.0" encoding="utf-8"?>
        <cf:Configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cf="http://www.enfocus.com/2011/PitStopServerCLI_Configuration.xsd">
        <cf:Versioning>
        <cf:Version>7</cf:Version>
        <cf:VersioningStrategy>MustHonor</cf:VersioningStrategy>
        </cf:Versioning>
        <cf:Initialize>
        <cf:ProcessingMethod>EnforceServer</cf:ProcessingMethod>
        </cf:Initialize>
        <cf:TaskReport>
        <cf:LogCommandLine>true</cf:LogCommandLine>
        <cf:LogProcessResults>true</cf:LogProcessResults>
        <cf:LogErrors>true</cf:LogErrors>
        </cf:TaskReport>
        <cf:Process>
        <cf:InputPDF>
        <cf:InputPath></cf:InputPath>
        </cf:InputPDF>
        <cf:OutputPDF>
        <cf:OutputPath></cf:OutputPath>
        </cf:OutputPDF>
        <cf:Mutators>
        </cf:Mutators>
        <cf:Reports>
        </cf:Reports>
        </cf:Process>
        </cf:Configuration>`;
    try {
      console.log("Saving basic configuration file " + this.finalConfigFile);
      fs.writeFileSync(this.finalConfigFile, xmlString);
    } catch (error) {
      throw error;
    }
  };
}
