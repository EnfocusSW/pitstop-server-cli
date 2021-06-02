export declare class PitStopServer {
    static applicationPath: string;
    static currentInstance: PitStopServer;
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
    debugMessages: string[];
    /**
     * Constructs a PitStopServer instance
     * @param options
     */
    constructor(options: {
        inputPDF: string;
        outputFolder: string;
        preflightProfile?: string;
        actionLists?: string[];
        variableSet?: string;
        pdfReport?: boolean;
        xmlReport?: boolean;
        configFile?: string;
        applicationPath?: string;
    });
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
     * Static method to clean up the output folder of the current instance
     */
    static cleanup: () => void;
    /**
     * Private static method to find the path to the PitStop Server CLI application in the Windows registry
     * @returns string
     */
    private static findPitStopServerInRegistry;
    run: () => Promise<object>;
    updateVariableSet: (values: {
        variable: string;
        value: string | number | boolean;
    }[]) => void;
    private updateConfigFile;
    private createBasicConfigFile;
}
