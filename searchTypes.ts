export interface JobResponse {
    totalCount: number;
    results:    ResultElement[];
    pageSize:   number;
    pageNumber: number;
}

export interface ResultElement {
    score:  number;
    result: Job;
}

export interface Job {
    contractType:       Industry | null;
    creationDate:       Date;
    description:        string;
    displayFromDate:    Date;
    employerId:         string;
    employerName:       string;
    expiryDate:         Date;
    howToApplyCode:     HowToApplyCode;
    industry:           Industry;
    isApplyOnlineJob:   boolean;
    isExternalJob:      boolean;
    isFavourite:        boolean;
    isIndigenousJob:    boolean;
    isNewJob:           boolean;
    jobType:            Industry;
    latitude:           null | string;
    location:           Industry;
    logoUrl:            string;
    longitude:          null | string;
    modifiedDate:       Date;
    occupation:         Industry;
    organisation:       Industry;
    positionsAvailable: number;
    postCode:           string;
    salary:             Industry;
    site:               Industry;
    state:              string;
    suburb:             string;
    tenure:             Industry;
    title:              string;
    vacancyId:          number;
    workType:           Industry;
}

export interface Industry {
    code:  string;
    label: string;
}

export enum HowToApplyCode {
    Aptr = "APTR",
    Psd = "PSD",
    Spcl = "SPCL",
}
