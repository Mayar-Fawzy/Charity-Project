
  export interface IvolunteerActivity {
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
    data: IDataa[]
  }
  
  export interface IDataa {
    id: string
    name: string
    organizerId: string
    activityDescription: string
    createdDate: string
    modifiedDate: string
  }
  