import { AxiosInstance } from 'axios';
import { Project } from './project';
export declare class ProjectsClient {
    private readonly baseURL;
    private readonly username;
    readonly connection: AxiosInstance;
    constructor(baseURL: string, username: string, password: string);
    addProject: (project: Project) => Promise<Project>;
}
