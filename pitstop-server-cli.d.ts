export interface PitStopServerOptions {
    inputPDF: string;
    outputFolder: string;
    preflightProfile?: string;
    actionLists?: string[];
    variableSet?: string;
    pdfReport?: boolean;
    xmlReport?: boolean;
    taskReport?: boolean;
    configFile?: string;
    applicationPath?: string;
}
export interface VariableSetOptions {
    variable: string;
    type: "Number" | "String" | "Boolean" | "Length";
    value: string | number | boolean;
}
export declare class PitStopServer {
    static applicationPath: string;
    private configFile;
    private finalConfigFile;
    private inputPDF;
    private outputFolder;
    private preflightProfile;
    private actionLists;
    private variableSet;
    private finalVariableSet;
    private pdfReport;
    private xmlReport;
    private taskReport;
    debugMessages: string[];
    /**
     * Constructs a PitStopServer instance
     * @param options
     */
    constructor(options: PitStopServerOptions);
    /**
     * Runs PitStop Server
     * @returns execution result
     */
    run: () => Promise<object>;
    /**
     * Based on a simple object the variable set file is created and saved in the output folder
     * @param values
     */
    createVariableSet: (values: {
        variable: string;
        type: "Number" | "String" | "Boolean" | "Length";
        value: string | number | boolean;
    }[]) => void;
    /**
     * The variable set template is updated and saved in its final version to the output folder
     * @param values
     */
    updateVariableSet: (values: {
        variable: string;
        value: string | number | boolean;
    }[]) => void;
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
