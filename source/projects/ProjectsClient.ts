import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

import { NotFoundError } from '../errors';
import { Project } from './project'

const  NOT_FOUND = '404';

export class ProjectsClient {

  readonly connection: AxiosInstance
  constructor(private readonly baseURL: string, private readonly username: string, password: string) {
    const auth = {
      username,
      password,
    }
    const config: AxiosRequestConfig = {
      auth,
      baseURL: `${baseURL}/remote.php/dav/`
      // headers: { Authorization: `Bearer ${token}` },
    }
     this.connection = axios.create(config)
  }

  addProject = async (
    project: Project,
  ): Promise<Project> => {
      const response = await this.connection({
          method: 'POST',
          url: `/projects/${project.owner}`,
          data: {
              name: project.name,
              'foreign-id': project.foreignId,
          },
      })
      const data = response.data
      const url = response.headers['content-location']
      return new Project(project.owner, data.name, data.id, project.foreignId, url)
  }
}
