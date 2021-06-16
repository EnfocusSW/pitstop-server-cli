/**
 * Export of the interface for the options when constructing a new instance of the PitStopServer class
 */
export interface PitStopServerOptions {
    inputPDF: string;
    outputPDFName?: string;
    outputFolder: string;
    preflightProfile?: string;
    actionLists?: string[];
    variableSet?: string;
    variableSetName?: string;
    pdfReport?: boolean;
    pdfReportName?: string;
    xmlReport?: boolean;
    xmlReportName?: string;
    taskReport?: boolean;
    taskReportName?: string;
    configFile?: string;
    configFileName?: string;
    applicationPath?: string;
    measurementUnit?: "Millimeter" | "Centimeter" | "Inch" | "Point";
    language?: string;
}
/**
 * Export of the interface for each individual variable for use in VariableSetOptions
 */
export interface VSOption {
    variable: string;
    type: "Number" | "String" | "Boolean" | "Length";
    value: string | number | boolean;
}
/**
 * Export of the interface for the creation or update of a variable set (an array of VSOption)
 */
export interface VariableSetOptions extends Array<VSOption> {
}
/**
 * Export of the class PitStop Server
 */
export declare class PitStopServer {
    static applicationPath: string;
    private configFile;
    private configFileName;
    private finalConfigFilePath;
    private inputPDF;
    private outputPDFName;
    private outputFolder;
    private preflightProfile;
    private actionLists;
    private variableSet;
    private variableSetName;
    private finalVariableSetPath;
    private pdfReport;
    private pdfReportName;
    private xmlReport;
    private xmlReportName;
    private taskReport;
    private taskReportName;
    debugMessages: string[];
    private measurementUnit?;
    private language?;
    private startExecutionTime;
    private endExecutionTime;
    executionTime: number;
    /**
     * Constructs a PitStopServer instance
     * @param options
     */
    constructor(options: PitStopServerOptions);
    /**
     * Runs PitStop Server
     * @returns execution result
     */
    run: () => Promise<Record<string, any>>;
    /**
     * Based on a simple object the variable set file is created and saved in the output folder
     * @param values
     */
    createVariableSet: (values: VariableSetOptions) => void;
    /**
     * The variable set template is updated and saved in its final version to the output folder
     * @param values
     */
    updateVariableSet: (values: VariableSetOptions) => void;
    /**
     * Removes the output folder and all the contents
     */
    cleanup: () => void;
    /**
     * Updates the config file with all settings just before running PitStop Server
     */
    private updateConfigFile;
    /**
     * Creates an XML string of a basic configuration file for PitStop Server
     */
    private createBasicConfigFile;
    /**
     * Static method returning the version number of PitStop Server
     * @returns string
     */
    static getVersion: () => Promise<any>;
    /**
     * Static function to get the path of the CLI application of PitStop Server
     * @returns string
     */
    static getApplicationPath: () => string;
    /**
     * Private static method to find the path to the PitStop Server CLI application in the Windows registry
     * @returns string
     */
    private static findPitStopServerInRegistry;
}
