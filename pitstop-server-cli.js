"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PitStopServer = void 0;
var fs = require("fs");
var xmldom_1 = require("xmldom");
var xpath = require("xpath");
var execa = require("execa");
var registry = require("registry-js");
var os = require("os");
var rimraf = require("rimraf");
var jstoxml_1 = require("jstoxml");
var path = require("path");
/**
 * Export of the class PitStop Server
 */
var PitStopServer = /** @class */ (function () {
    //////////////////////////////////////////////////////////////////////////
    //
    // Constructor
    //
    //////////////////////////////////////////////////////////////////////////
    /**
     * Constructs a PitStopServer instance
     * @param options
     */
    function PitStopServer(options) {
        var _this = this;
        //////////////////////////////////////////////////////////////////////////
        //
        // PitStopServer public instance methods
        //
        //////////////////////////////////////////////////////////////////////////
        /**
         * Runs PitStop Server
         * @returns execution result
         */
        this.run = function () { return __awaiter(_this, void 0, void 0, function () {
            var execResult, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        //add the input file, output folder and the profile and action lists, the report types, and the variable set to the config file
                        try {
                            this.updateConfigFile();
                        }
                        catch (error) {
                            throw error;
                        }
                        //the return value is an object with the execution result
                        this.debugMessages.push("CLI path: " + PitStopServer.applicationPath);
                        this.debugMessages.push("PitStop Server started at " + new Date().toISOString());
                        this.startExecutionTime = new Date().getTime();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, execa(PitStopServer.applicationPath, ["-config", this.finalConfigFilePath])];
                    case 2:
                        execResult = _b.sent();
                        this.debugMessages.push("PitStop Server ended at " + new Date().toISOString());
                        this.endExecutionTime = new Date().getTime();
                        this.executionTime = this.endExecutionTime - this.startExecutionTime;
                        return [2 /*return*/, execResult];
                    case 3:
                        error_1 = _b.sent();
                        this.endExecutionTime = new Date().getTime();
                        this.executionTime = this.endExecutionTime - this.startExecutionTime;
                        return [2 /*return*/, { command: error_1.command, exitCode: error_1.exitCode, stdout: error_1.stdout, stderr: error_1.message }];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Based on a simple object the variable set file is created and saved in the output folder
         * @param values
         */
        this.createVariableSet = function (values) {
            _this.debugMessages.push("Creating a variable set");
            _this.variableSet = _this.outputFolder + "/" + _this.variableSetName;
            _this.finalVariableSetPath = _this.outputFolder + "/" + _this.variableSetName;
            var xmlOptions = {
                header: true,
                indent: "  "
            };
            var variableNode, variabletype;
            var variableNodes = [];
            for (var i = 0; i < values.length; i++) {
                variableNode = {
                    _name: "Variable",
                    _content: {
                        Name: values[i].variable,
                        ResultType: values[i].type,
                        SourceType: "com.enfocus.variabletype.inline",
                        SourceVersion: "1",
                        OperatorID: (i + 1).toString()
                    }
                };
                variableNodes.push(variableNode);
            }
            var operatorNode;
            var operatorNodes = [];
            for (var i = 0; i < values.length; i++) {
                if (values[i].type == "Length") {
                    //convert to points based on the measurementUnit
                    if (_this.measurementUnit == "Millimeter") {
                        _this.debugMessages.push("Converting value of " + values[i].variable + " (" + values[i].value + ") from mm to points");
                        values[i].value = (parseFloat(values[i].value.toString()) / 25.4) * 72;
                    }
                    else if (_this.measurementUnit == "Centimeter") {
                        _this.debugMessages.push("Converting value of " + values[i].variable + " (" + values[i].value + ") from cm to points");
                        values[i].value = (parseFloat(values[i].value.toString()) / 2.54) * 72;
                    }
                    else if (_this.measurementUnit == "Inch") {
                        _this.debugMessages.push("Converting value of " + values[i].variable + " (" + values[i].value + ") from in to points");
                        values[i].value = parseFloat(values[i].value.toString()) * 72;
                    }
                    if (isNaN(values[i].value)) {
                        _this.debugMessages.push("The value of " + values[i].variable + " was not a number, it is set to 0");
                        values[i].value = 0;
                    }
                }
                operatorNode = {
                    _name: "Operator",
                    _content: {
                        OperatorType: "com.enfocus.operator.constant",
                        GUID: (i + 1).toString(),
                        OperatorData: { Value: values[i].value, ValueType: "String" },
                        OperatorVersion: 1
                    }
                };
                operatorNodes.push(operatorNode);
            }
            var evs = {
                _name: "VariableSet",
                _attrs: {
                    xmlns: "http://www.enfocus.com/2012/EnfocusVariableSet"
                },
                _content: {
                    Version: "1",
                    Name: "variableset",
                    Variables: variableNodes,
                    Operators: operatorNodes
                }
            };
            try {
                fs.writeFileSync(_this.finalVariableSetPath, (0, jstoxml_1.toXML)(evs, xmlOptions));
            }
            catch (err) {
                throw err;
            }
        };
        /**
         * The variable set template is updated and saved in its final version to the output folder
         * @param values
         */
        this.updateVariableSet = function (values) {
            if (_this.finalVariableSetPath == undefined) {
                throw new Error("There is no Variable Set defined");
            }
            // Process the input variable set so it is filled with the correct values from the values that are specified
            _this.debugMessages.push("Modifying the variable set file");
            var evs;
            try {
                var evsContent = fs.readFileSync(_this.finalVariableSetPath).toString();
                var parser = new xmldom_1.DOMParser({
                    locator: {},
                    errorHandler: {
                        warning: function (msg) {
                            //ignore
                        },
                        error: function (msg) {
                            throw new Error(msg);
                        },
                        fatalError: function (msg) {
                            throw new Error(msg);
                        }
                    }
                });
                evs = parser.parseFromString(evsContent);
            }
            catch (error) {
                throw error;
            }
            var select = xpath.useNamespaces({ evs: "http://www.enfocus.com/2012/EnfocusVariableSet" });
            //modify the EVS structure with the new values
            //typing the variables is very unpractical with xpath, so here it is mostly any
            var node;
            var oldValue, newValue;
            var operatorID;
            var xpExpression;
            var resultType;
            var oldUnitNode, newUnitNode;
            var unitNodeParent, unitNodeText;
            for (var i = 0; i < values.length; i++) {
                xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:OperatorID";
                operatorID = select("string(" + xpExpression + ")", evs).toString();
                if (operatorID == "") {
                    throw new Error("The variable " + values[i].variable + " is not present in the variable set " + _this.variableSet);
                }
                xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:ResultType";
                resultType = select("string(" + xpExpression + ")", evs).toString();
                if (resultType == "Length") {
                    xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:DefaultUnit";
                    oldUnitNode = select(xpExpression, evs);
                    unitNodeText = evs.createText("mm");
                    if (oldUnitNode == undefined) {
                        newUnitNode = evs.createElement("evs:DefaultUnit");
                        newUnitNode.appendChild(unitNodeText);
                        unitNodeParent = select("/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']", evs);
                        unitNodeParent.appendChild(newUnitNode);
                    }
                    else {
                        oldUnitNode.replaceChild(unitNodeText, oldUnitNode.getFirstChild());
                    }
                }
                xpExpression = "/evs:VariableSet/evs:Operators/evs:Operator[evs:GUID='" + operatorID + "']/evs:OperatorData/evs:Value";
                node = select(xpExpression, evs);
                if (node.length == 0) {
                    throw new Error("Error finding a value for variable " + values[i].variable + " in the variable set");
                }
                else {
                    oldValue = select("evs:Value", evs);
                    newValue = evs.createTextNode(values[i].value.toString());
                    //node.replaceChild(newValue, node.getFirstChild());
                    node[0].replaceChild(newValue, oldValue);
                }
            }
            try {
                fs.writeFileSync(_this.finalVariableSetPath, evs.toString());
            }
            catch (err) {
                throw err;
            }
        };
        /**
         * Removes the output folder and all the contents
         */
        this.cleanup = function () {
            try {
                rimraf.sync(_this.outputFolder);
            }
            catch (error) {
                throw error;
            }
        };
        //////////////////////////////////////////////////////////////////////////
        //
        // PitStopServer private API methods
        //
        //////////////////////////////////////////////////////////////////////////
        /**
         * Updates the config file with all settings just before running PitStop Server
         */
        this.updateConfigFile = function () {
            //read the final XML config file into a DOM for modification
            //the final config file is either a basic one created by the class or
            //a copy of a config file provided by the calling instance
            _this.debugMessages.push("Modifying the configuration file");
            var xml;
            try {
                var xmlContent = fs.readFileSync(_this.finalConfigFilePath).toString();
                var parser = new xmldom_1.DOMParser({
                    locator: {},
                    errorHandler: {
                        warning: function (msg) {
                            //ignore
                        },
                        error: function (msg) {
                            throw new Error(msg);
                        },
                        fatalError: function (msg) {
                            throw new Error(msg);
                        }
                    }
                });
                xml = parser.parseFromString(xmlContent);
            }
            catch (error) {
                throw error;
            }
            var select = xpath.useNamespaces({ cf: "http://www.enfocus.com/2011/PitStopServerCLI_Configuration.xsd" });
            var newElem, newText;
            //modify the config file
            var inputFileName = "";
            try {
                //fill in the input file and the output file
                if (typeof _this.inputPDF == "string") {
                    _this.debugMessages.push("Adding the input file " + _this.inputPDF + " to the configuration file");
                    if (fs.existsSync(_this.inputPDF) == false) {
                        throw new Error("The input PDF " + _this.inputPDF + " does not exist");
                    }
                    var inputPathNode = select("//cf:InputPath", xml);
                    newText = xml.createTextNode(_this.inputPDF);
                    //inputPathNode.appendChild(newText);
                    inputPathNode[0].appendChild(newText);
                    inputFileName = path.parse(_this.inputPDF).name;
                }
                if (typeof _this.outputFolder == "string") {
                    if (fs.existsSync(_this.outputFolder) == false) {
                        throw new Error("The output folder " + _this.outputFolder + " does not exist");
                    }
                    var outputPathNode = select("//cf:OutputPath", xml);
                    newText = xml.createTextNode(_this.outputFolder + "/" + _this.outputPDFName);
                    outputPathNode[0].appendChild(newText);
                }
                var mutatorsNode = select("//cf:Mutators", xml);
                //add the preflight profile
                if (typeof _this.preflightProfile == "string") {
                    _this.debugMessages.push("Adding the preflight profile " + _this.preflightProfile + " to the configuration file");
                    if (fs.existsSync(_this.preflightProfile) == false) {
                        throw new Error("The Preflight Profile " + _this.preflightProfile + " does not exist");
                    }
                    _this.debugMessages.push("Adding preflight profile " + _this.preflightProfile);
                    newElem = xml.createElement("cf:PreflightProfile");
                    newText = xml.createTextNode(_this.preflightProfile);
                    newElem.appendChild(newText);
                    mutatorsNode.appendChild(newElem);
                }
                //add the action lists
                if (_this.actionLists !== undefined && _this.actionLists.constructor == Array) {
                    for (var i = 0; i < _this.actionLists.length; i++) {
                        if (fs.existsSync(_this.actionLists[i]) == false) {
                            throw new Error("The Action List " + _this.actionLists[i] + " does not exist");
                        }
                        _this.debugMessages.push("Adding action list " + _this.actionLists[i]);
                        newElem = xml.createElement("cf:ActionList");
                        newText = xml.createTextNode(_this.actionLists[i]);
                        newElem.appendChild(newText);
                        mutatorsNode[0].appendChild(newElem);
                    }
                }
                //add the reports
                if (_this.xmlReport == true) {
                    _this.debugMessages.push("Defining an XML report");
                    var reportsNode = select("//cf:Reports", xml);
                    var newElemReportXML = xml.createElement("cf:ReportXML");
                    reportsNode[0].appendChild(newElemReportXML);
                    var newElemReportPath = xml.createElement("cf:ReportPath");
                    var newReportPathText = xml.createTextNode(_this.outputFolder + "/" + _this.xmlReportName);
                    newElemReportPath.appendChild(newReportPathText);
                    newElemReportXML.appendChild(newElemReportPath);
                    var newElemVersion = xml.createElement("cf:Version");
                    var newVersionText = xml.createTextNode("3");
                    newElemVersion.appendChild(newVersionText);
                    newElemReportXML.appendChild(newElemVersion);
                    var newElemNrItems = xml.createElement("cf:MaxReportedNbItemsPerCategory");
                    var newNrItemsText = xml.createTextNode("-1");
                    newElemNrItems.appendChild(newNrItemsText);
                    newElemReportXML.appendChild(newElemNrItems);
                    var newElemNrOccurrences = xml.createElement("cf:MaxReportedNbOccurrencesPerItem");
                    var newNrOccurrencesText = xml.createTextNode("-1");
                    newElemNrOccurrences.appendChild(newNrOccurrencesText);
                    newElemReportXML.appendChild(newElemNrOccurrences);
                }
                if (_this.pdfReport == true) {
                    _this.debugMessages.push("Defining a PDF report");
                    var reportsNode = select("//cf:Reports", xml);
                    var newElemReportPDF = xml.createElement("cf:ReportPDF");
                    reportsNode[0].appendChild(newElemReportPDF);
                    var newElemReportPath = xml.createElement("cf:ReportPath");
                    var newReportPathText = xml.createTextNode(_this.outputFolder + "/" + _this.pdfReportName);
                    newElemReportPath.appendChild(newReportPathText);
                    newElemReportPDF.appendChild(newElemReportPath);
                }
                if (_this.taskReport == true) {
                    _this.debugMessages.push("Defining a task report");
                    var taskReportNode = select("//cf:TaskReport", xml);
                    var newElemTaskReport = xml.createElement("cf:TaskReportPath");
                    taskReportNode[0].appendChild(newElemTaskReport);
                    var newReportPathText = xml.createTextNode(_this.outputFolder + "/" + _this.taskReportName);
                    newElemTaskReport.appendChild(newReportPathText);
                }
                var processNode = select("//cf:Process", xml);
                //add the variable set
                if (typeof _this.variableSet == "string") {
                    if (fs.existsSync(_this.finalVariableSetPath) == false) {
                        throw new Error("The Variable Set " + _this.finalVariableSetPath + " does not exist");
                    }
                    _this.finalVariableSetPath = _this.outputFolder + "/" + _this.variableSetName;
                    if (_this.variableSet !== _this.finalVariableSetPath) {
                        _this.debugMessages.push("Copying the variable set " + _this.variableSet);
                        fs.copyFileSync(_this.variableSet, _this.finalVariableSetPath);
                    }
                    _this.debugMessages.push("Adding the variable set " + _this.finalVariableSetPath);
                    var variableSetNode = select("cf:SmartPreflight/cf:VariableSet", processNode[0]);
                    if (variableSetNode.length !== 0) {
                        var oldValue = select("//cf:Process/cf:SmartPreflight/cf:VariableSet", xml);
                        var newValue = xml.createTextNode(_this.finalVariableSetPath);
                        variableSetNode[0].replaceChild(newValue, oldValue);
                    }
                    else {
                        var newElemSmartPreflight = xml.createElement("cf:SmartPreflight");
                        processNode[0].appendChild(newElemSmartPreflight);
                        var newElemVariableSet = xml.createElement("cf:VariableSet");
                        var newVariableSetText = xml.createTextNode(_this.finalVariableSetPath);
                        newElemVariableSet.appendChild(newVariableSetText);
                        newElemSmartPreflight.appendChild(newElemVariableSet);
                    }
                }
                //add the measurement units
                var measurementUnitNode = select("//cf:MeasurementUnit", xml);
                if (measurementUnitNode.length == 0) {
                    _this.debugMessages.push("The configuration file does not contain a node for the measurement unit. The default will be used.");
                }
                else {
                    var measurementUnitText = xml.createTextNode(_this.measurementUnit);
                    measurementUnitNode[0].appendChild(measurementUnitText);
                }
                //add the language
                var languageNode = select("//cf:Language", xml);
                if (languageNode.length == 0) {
                    _this.debugMessages.push("The configuration file does not contain a node for the language. The default will be used.");
                }
                else {
                    var languageText = xml.createTextNode(_this.language);
                    languageNode[0].appendChild(languageText);
                }
                //save the modified config file to the output folder
                _this.debugMessages.push("Saving the final configuration file " + _this.finalConfigFilePath);
                fs.writeFileSync(_this.finalConfigFilePath, xml.toString());
            }
            catch (error) {
                throw error;
            }
        };
        /**
         * Creates an XML string of a basic configuration file for PitStop Server
         */
        this.createBasicConfigFile = function () {
            _this.debugMessages.push("Creating a basic configuration file");
            var xmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n        <cf:Configuration xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:cf=\"http://www.enfocus.com/2011/PitStopServerCLI_Configuration.xsd\">\n        <cf:Versioning>\n        <cf:Version>7</cf:Version>\n        <cf:VersioningStrategy>MustHonor</cf:VersioningStrategy>\n        </cf:Versioning>\n        <cf:Initialize>\n        <cf:ProcessingMethod>EnforceServer</cf:ProcessingMethod>\n        <cf:ShutDownServerAtExit>false</cf:ShutDownServerAtExit>\n        </cf:Initialize>\n        <cf:TaskReport>\n        <cf:LogCommandLine>true</cf:LogCommandLine>\n        <cf:LogProcessResults>true</cf:LogProcessResults>\n        <cf:LogErrors>true</cf:LogErrors>\n        <cf:LogSupportInfo>true</cf:LogSupportInfo>\n        </cf:TaskReport>\n        <cf:Process>\n        <cf:InputPDF>\n        <cf:InputPath></cf:InputPath>\n        </cf:InputPDF>\n        <cf:OutputPDF>\n        <cf:OutputPath></cf:OutputPath>\n        </cf:OutputPDF>\n        <cf:Mutators>\n        </cf:Mutators>\n        <cf:Reports>\n        </cf:Reports>\n        <cf:MeasurementUnit></cf:MeasurementUnit>\n        <cf:Language></cf:Language>\n        </cf:Process>\n        </cf:Configuration>";
            try {
                _this.debugMessages.push("Saving basic configuration file " + _this.finalConfigFilePath);
                fs.writeFileSync(_this.finalConfigFilePath, xmlString);
            }
            catch (error) {
                throw error;
            }
        };
        //check the presence of the mandatory options
        if (options.inputPDF == undefined || options.outputFolder == undefined) {
            throw new Error("The mandatory options for running PitStop Server were not correctly defined");
        }
        if (options.actionLists == undefined && options.preflightProfile == undefined) {
            throw new Error("There was neither a Preflight Profile nor any Action Lists defined for running PitStop Server");
        }
        //set some default values
        this.debugMessages = [];
        this.configFileName = "config.xml";
        this.xmlReport = false;
        this.taskReportName = "taskreport.xml";
        this.variableSetName = "variableset.evs";
        this.measurementUnit = "Millimeter";
        this.language = "enUS";
        this.executionTime = 0;
        //initialize the instance variables with the values of the options
        for (var option in options) {
            this.debugMessages.push("Received option " + option + " = " + options[option]);
            switch (option) {
                case "inputPDF":
                    this.inputPDF = options.inputPDF;
                    break;
                case "outputPDFName":
                    this.outputPDFName = options.outputPDFName;
                case "outputFolder":
                    this.outputFolder = options.outputFolder;
                    break;
                case "preflightProfile":
                    this.preflightProfile = options.preflightProfile;
                    break;
                case "actionLists":
                    this.actionLists = options.actionLists;
                    break;
                case "variableSet":
                    this.variableSet = options.variableSet;
                    break;
                case "pdfReport":
                    this.pdfReport = options.pdfReport;
                    break;
                case "pdfReportName":
                    this.pdfReportName = options.pdfReportName;
                    break;
                case "xmlReport":
                    this.xmlReport = options.xmlReport;
                    break;
                case "xmlReportName":
                    this.xmlReportName = options.xmlReportName;
                    break;
                case "taskReport":
                    this.taskReport = options.taskReport;
                    break;
                case "taskReportName":
                    this.taskReportName = options.taskReportName;
                    break;
                case "configFile":
                    this.configFile = options.configFile;
                    break;
                case "configFileName":
                    this.configFileName = options.configFileName;
                    break;
                case "applicationPath":
                    PitStopServer.applicationPath = options.applicationPath;
                    break;
                case "measurementUnit":
                    this.measurementUnit = options.measurementUnit;
                    break;
                case "language":
                    this.language = options.language;
                    break;
                default:
                    this.debugMessages.push("Unknown option " + option + " specified");
            }
        }
        //set default values that are based on the input PDF name
        if (this.outputPDFName == undefined) {
            this.outputPDFName = path.parse(this.inputPDF).name + ".pdf";
        }
        if (this.pdfReportName == undefined) {
            this.pdfReportName = path.parse(this.inputPDF).name + "_report.pdf";
        }
        if (this.xmlReportName == undefined) {
            this.xmlReportName = path.parse(this.inputPDF).name + ".xml";
        }
        //check if the output folder exists and is writable
        if (fs.existsSync(this.outputFolder) == false) {
            throw new Error("The output folder " + options.outputFolder + " does not exist");
        }
        else {
            try {
                fs.accessSync(this.outputFolder, fs.constants.W_OK);
            }
            catch (error) {
                throw new Error("The output folder " + options.outputFolder + " is not writable");
            }
        }
        //check if the specified path to the cli exists or find it
        if (PitStopServer.applicationPath !== undefined) {
            if (fs.existsSync(PitStopServer.applicationPath) == false) {
                throw new Error("The path to the CLI does not exist (" + PitStopServer.applicationPath + ")");
            }
        }
        else {
            try {
                this.debugMessages.push("Searching for the application path");
                PitStopServer.getApplicationPath();
            }
            catch (error) {
                throw error;
            }
        }
        //create a basic config file if needed
        this.finalConfigFilePath = this.outputFolder + "/" + this.configFileName;
        if (options.configFile == undefined) {
            this.createBasicConfigFile();
        }
        else {
            this.debugMessages.push("Using template configuration file " + options.configFile);
            if (fs.existsSync(this.configFile) == false) {
                throw new Error("The configuration file " + this.configFile + " does not exist");
            }
            else {
                fs.copyFileSync(this.configFile, this.finalConfigFilePath);
            }
        }
    }
    var _a;
    _a = PitStopServer;
    //////////////////////////////////////////////////////////////////////////
    //
    // PitStopServer static API methods
    //
    //////////////////////////////////////////////////////////////////////////
    /**
     * Static method returning the version number of PitStop Server
     * @returns string
     */
    PitStopServer.getVersion = function () { return __awaiter(void 0, void 0, void 0, function () {
        var execResult, error_2;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    //get the application path of PitStop Server
                    if (PitStopServer.applicationPath == undefined) {
                        try {
                            PitStopServer.getApplicationPath();
                        }
                        catch (error) {
                            throw error;
                        }
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, execa(PitStopServer.applicationPath, ["-version"])];
                case 2:
                    execResult = _b.sent();
                    return [2 /*return*/, execResult.stdout];
                case 3:
                    error_2 = _b.sent();
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Static function to get the path of the CLI application of PitStop Server
     * @returns string
     */
    PitStopServer.getApplicationPath = function () {
        if (PitStopServer.applicationPath !== undefined) {
            return PitStopServer.applicationPath;
        }
        if (os.platform().startsWith("win") == true) {
            //access the registry to find the path to PitStop Server
            try {
                PitStopServer.applicationPath = PitStopServer.findPitStopServerInRegistry();
            }
            catch (error) {
                throw error;
            }
            return PitStopServer.applicationPath;
        }
        else {
            //locate PitStop Server in the OSX Applications folder; the name of this folder is only localized in the Finder so it is /Applications regardless of the system language
            var enfocusDir = "/Applications/Enfocus";
            var psPath = "";
            try {
                var enfocusList = fs.readdirSync(enfocusDir);
                for (var i = 0; i < enfocusList.length; i++) {
                    if (enfocusList[i].startsWith("Enfocus PitStop Server") == true) {
                        psPath = enfocusDir + "/" + enfocusList[i];
                    }
                }
                if (psPath == "") {
                    throw new Error("Could not find the Enfocus PitStopServerCLI symbolic link in " + enfocusDir);
                }
            }
            catch (error) {
                throw error;
            }
            try {
                PitStopServer.applicationPath = fs.realpathSync(psPath + "/PitStopServerCLI");
            }
            catch (error) {
                throw error;
            }
        }
        return PitStopServer.applicationPath;
    };
    /**
     * Private static method to find the path to the PitStop Server CLI application in the Windows registry
     * @returns string
     */
    PitStopServer.findPitStopServerInRegistry = function () {
        var values;
        try {
            values = registry.enumerateValues(registry.HKEY.HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\PitStop Server.exe");
        }
        catch (error) {
            throw error;
        }
        var applicationPath = "";
        for (var i = 0; i < values.length; i++) {
            if ((values[i].name == "Path")) {
                applicationPath = values[i].data;
                break;
            }
        }
        if (applicationPath == "") {
            throw new Error("No key found with the name Path under PitStop Server.exe in the registry");
        }
        else {
            return applicationPath + "\\PitStopServerCLI.exe";
        }
    };
    return PitStopServer;
}());
exports.PitStopServer = PitStopServer;
