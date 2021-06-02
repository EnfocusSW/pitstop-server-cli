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
    static getVersion: () => Promise<any>;
    static getApplicationPath: () => string;
    static cleanup: () => void;
    private static findPitStopServerInRegistry;
    run: () => Promise<object>;
    updateVariableSet: (values: {
        variable: string;
        value: string | number | boolean;
    }[]) => void;
    private updateConfigFile;
    private createBasicConfigFile;
}
