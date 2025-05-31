
export interface ICreateVolunteerActivity {
  organizerId: string
  name: string
  activityDescription: string
}
export interface IUpdateVolunteerActivity {
  id: string
  organizerId: string
  name: string
  activityDescription: string
}
export interface IGetPaginatedVolunteerActivities {
  pageSize: number
  currentPage: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  statusCode: number
  isSucceeded: boolean
  message: string
  errors: string
  meta: any
  data: IVolunteerActivities[]
}

export interface IVolunteerActivities {
  id: string
  organizerId: string
  name: string
  activityDescription: string
  createdDate: string
  modifiedDate: string
}

