export interface OcsActivity {
  activityId: number,
  app: string,
  type: string,
  user: string,
  subject: string,
  subjectRich: [],
  message: string,
  messageRich: [],
  objectType: string,
  objectId: number,
  objectName: string,
  objects: {},
  link: string,
  icon: string,
  datetime: Date
}
