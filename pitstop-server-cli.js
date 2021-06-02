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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PitStopServer = void 0;
var fs = require("fs");
var xmldom_1 = require("xmldom");
var xpath = require("xpath");
var execa = require("execa");
var registry = require("registry-js");
var os = require("os");
var rimraf = require("rimraf");
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
        this.run = function () { return __awaiter(_this, void 0, void 0, function () {
            var execResult, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //the return value is an object with the execution result
                        this.debugMessages.push("CLI path: " + PitStopServer.applicationPath);
                        this.debugMessages.push("PitStop Server start at " + new Date().toISOString());
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, execa(PitStopServer.applicationPath, ["-config", this.finalConfigFile])];
                    case 2:
                        execResult = _a.sent();
                        this.debugMessages.push("PitStop Server end at " + new Date().toISOString());
                        return [2 /*return*/, execResult];
                    case 3:
                        error_1 = _a.sent();
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.updateVariableSet = function (values) {
            if (_this.finalVariableSet == undefined) {
                throw new Error("There is no Variable Set defined");
            }
            // Process the input variable set so it is filled with the correct values from the values that are specified
            _this.debugMessages.push("Modifying the variable set file");
            var evs;
            try {
                var evsContent = fs.readFileSync(_this.finalVariableSet).toString();
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
                        },
                    },
                });
                evs = parser.parseFromString(evsContent);
            }
            catch (error) {
                throw error;
            }
            var select = xpath.useNamespaces({ evs: "http://www.enfocus.com/2012/EnfocusVariableSet" });
            //modify the EVS structure with the new values
            var node;
            var oldValue, newValue;
            var operatorID;
            var xpExpression;
            var resultType;
            var oldUnitNode, newUnitNode;
            var unitNodeParent, unitNodeText;
            for (var i = 0; i < values.length; i++) {
                xpExpression = "/evs:VariableSet/evs:Variables/evs:Variable[evs:Name='" + values[i].variable + "']/evs:OperatorID";
                operatorID = select("string(" + xpExpression + ")", evs);
                if (operatorID == "") {
                    throw new Error("The variable " + values[i].variable + " is not present in the variable set " + _this.variableSet);
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
                fs.writeFileSync(_this.finalVariableSet, evs.toString());
            }
            catch (err) {
                throw err;
            }
        };
        //////////////////////////////////////////////////////////////////////////
        //
        // PitStopServer private API methods
        //
        //////////////////////////////////////////////////////////////////////////
        this.updateConfigFile = function (options) {
            //read the final XML config file into a DOM for modification
            //the final config file is either a basic one created by the class or
            //a copy of a config file provided by the calling instance
            _this.debugMessages.push("Modifying the configuration file");
            var xml;
            try {
                var xmlContent = fs.readFileSync(_this.finalConfigFile).toString();
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
                        },
                    },
                });
                xml = parser.parseFromString(xmlContent);
            }
            catch (error) {
                throw error;
            }
            var select = xpath.useNamespaces({ cf: "http://www.enfocus.com/2011/PitStopServerCLI_Configuration.xsd" });
            var newElem, newText;
            //modify the config file
            try {
                //fill in the input file and the output file
                if (typeof options.inputPDF == "string") {
                    if (fs.existsSync(options.inputPDF) == false) {
                        throw new Error("The input PDF " + options.inputPDF + " does not exist");
                    }
                    var inputPathNode = select("//cf:InputPath", xml);
                    newText = xml.createTextNode(options.inputPDF);
                    inputPathNode[0].appendChild(newText);
                }
                if (typeof options.outputFolder == "string") {
                    if (fs.existsSync(options.outputFolder) == false) {
                        throw new Error("The output folder " + options.outputFolder + " does not exist");
                    }
                    var outputPathNode = select("//cf:OutputPath", xml);
                    newText = xml.createTextNode(options.outputFolder + "/output.pdf");
                    outputPathNode[0].appendChild(newText);
                }
                var mutatorsNode = select("//cf:Mutators", xml);
                //add the preflight profile
                if (typeof options.preflightProfile == "string") {
                    if (fs.existsSync(options.preflightProfile) == false) {
                        throw new Error("The Preflight Profile " + options.preflightProfile + " does not exist");
                    }
                    _this.debugMessages.push("Adding preflight profile " + options.preflightProfile);
                    newElem = xml.createElement("cf:PreflightProfile");
                    newText = xml.createTextNode(options.preflightProfile);
                    newElem.appendChild(newText);
                    mutatorsNode.appendChild(newElem);
                }
                //add the action lists
                if (options.actionLists !== undefined && options.actionLists.constructor == Array) {
                    for (var i = 0; i < options.actionLists.length; i++) {
                        if (fs.existsSync(options.actionLists[i]) == false) {
                            throw new Error("The Action List " + options.actionLists[i] + " does not exist");
                        }
                        _this.debugMessages.push("Adding action list " + options.actionLists[i]);
                        newElem = xml.createElement("cf:ActionList");
                        newText = xml.createTextNode(options.actionLists[i]);
                        newElem.appendChild(newText);
                        mutatorsNode[0].appendChild(newElem);
                    }
                }
                //add the reports
                if (options.xmlReport == true) {
                    _this.debugMessages.push("Defining an XML report");
                    var reportsNode = select("//cf:Reports", xml);
                    var newElemReportXML = xml.createElement("cf:ReportXML");
                    reportsNode[0].appendChild(newElemReportXML);
                    var newElemReportPath = xml.createElement("cf:ReportPath");
                    var newReportPathText = xml.createTextNode(options.outputFolder + "/report.xml");
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
                if (options.pdfReport == true) {
                    _this.debugMessages.push("Defining a PDF report");
                    var reportsNode = select("//cf:Reports", xml);
                    var newElemReportPDF = xml.createElement("cf:ReportPDF");
                    reportsNode[0].appendChild(newElemReportPDF);
                    var newElemReportPath = xml.createElement("cf:ReportPath");
                    var newReportPathText = xml.createTextNode(options.outputFolder + "/report.pdf");
                    newElemReportPath.appendChild(newReportPathText);
                    newElemReportPDF.appendChild(newElemReportPath);
                }
                //add the variable set
                if (typeof options.variableSet == "string") {
                    if (fs.existsSync(options.variableSet) == false) {
                        throw new Error("The Variable Set " + options.variableSet + " does not exist");
                    }
                    _this.finalVariableSet = _this.outputFolder + "/variableset.evs";
                    if (options.variableSet !== _this.finalVariableSet) {
                        _this.debugMessages.push("Copying the variable set " + options.variableSet);
                        fs.copyFileSync(options.variableSet, _this.finalVariableSet);
                    }
                    _this.debugMessages.push("Adding the variable set " + _this.finalVariableSet);
                    var processNode = select("//cf:Process", xml);
                    var variableSetNode = select("cf:SmartPreflight/cf:VariableSet", processNode[0]);
                    if (variableSetNode.length !== 0) {
                        var oldValue = select("//cf:Process/cf:SmartPreflight/cf:VariableSet", xml);
                        var newValue = xml.createTextNode(options.finalVariableSet);
                        variableSetNode[0].replaceChild(newValue, oldValue);
                    }
                    else {
                        var newElemSmartPreflight = xml.createElement("cf:SmartPreflight");
                        processNode[0].appendChild(newElemSmartPreflight);
                        var newElemVariableSet = xml.createElement("cf:VariableSet");
                        var newVariableSetText = xml.createTextNode(_this.finalVariableSet);
                        newElemVariableSet.appendChild(newVariableSetText);
                        newElemSmartPreflight.appendChild(newElemVariableSet);
                    }
                }
                //save the modified config file to the output folder
                _this.debugMessages.push("Saving the final configuration file " + _this.finalConfigFile);
                fs.writeFileSync(_this.finalConfigFile, xml.toString());
            }
            catch (error) {
                throw error;
            }
        };
        this.createBasicConfigFile = function () {
            _this.debugMessages.push("Creating a basic configuration file");
            var xmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n        <cf:Configuration xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:cf=\"http://www.enfocus.com/2011/PitStopServerCLI_Configuration.xsd\">\n        <cf:Versioning>\n        <cf:Version>7</cf:Version>\n        <cf:VersioningStrategy>MustHonor</cf:VersioningStrategy>\n        </cf:Versioning>\n        <cf:Initialize>\n        <cf:ProcessingMethod>EnforceServer</cf:ProcessingMethod>\n        </cf:Initialize>\n        <cf:TaskReport>\n        <cf:LogCommandLine>true</cf:LogCommandLine>\n        <cf:LogProcessResults>true</cf:LogProcessResults>\n        <cf:LogErrors>true</cf:LogErrors>\n        </cf:TaskReport>\n        <cf:Process>\n        <cf:InputPDF>\n        <cf:InputPath></cf:InputPath>\n        </cf:InputPDF>\n        <cf:OutputPDF>\n        <cf:OutputPath></cf:OutputPath>\n        </cf:OutputPDF>\n        <cf:Mutators>\n        </cf:Mutators>\n        <cf:Reports>\n        </cf:Reports>\n        </cf:Process>\n        </cf:Configuration>";
            try {
                console.log("Saving basic configuration file " + _this.finalConfigFile);
                fs.writeFileSync(_this.finalConfigFile, xmlString);
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
        //initialize the instance variables with the values of the options
        for (var option in options) {
            if (option == "applicationPath") {
                PitStopServer.applicationPath = options.applicationPath;
            }
            else {
                var declaration = "this." + option + "='" + options[option] + "'";
                console.log(declaration);
                eval(declaration);
            }
        }
        this.debugMessages = [];
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
                PitStopServer.getApplicationPath();
            }
            catch (error) {
                throw error;
            }
        }
        //create a basic config file if needed
        this.finalConfigFile = this.outputFolder + "/config.xml";
        if (options.configFile == undefined) {
            this.createBasicConfigFile();
        }
        else {
            this.debugMessages.push("Using provided configuration file " + options.configFile);
            if (fs.existsSync(this.configFile) == false) {
                throw new Error("The configuration file " + this.configFile + " does not exist");
            }
            else {
                fs.copyFileSync(this.configFile, this.finalConfigFile);
            }
        }
        //add the input file, output folder and the profile and action lists, and the variable set to the config file
        try {
            this.updateConfigFile(options);
        }
        catch (error) {
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
    PitStopServer.getVersion = function () { return __awaiter(void 0, void 0, void 0, function () {
        var execResult, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //get the application path of PitStop Server
                    if (PitStopServer.applicationPath == undefined) {
                        try {
                            console.log("getting the application path");
                            PitStopServer.getApplicationPath();
                        }
                        catch (error) {
                            throw error;
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, execa(PitStopServer.applicationPath, ["-version"])];
                case 2:
                    execResult = _a.sent();
                    return [2 /*return*/, execResult.stdout];
                case 3:
                    error_2 = _a.sent();
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
     * Static method to clean up the output folder of the current instance
     */
    PitStopServer.cleanup = function () {
        try {
            rimraf.sync(PitStopServer.currentInstance.outputFolder);
        }
        catch (error) {
            //no need to throw an error when this method fails
        }
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
            if ((values[i].name = "Path")) {
                applicationPath = values[i].data;
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
