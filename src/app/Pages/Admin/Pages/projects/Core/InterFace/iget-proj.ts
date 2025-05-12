
export interface IGetProj {
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
  data: GetProjj[]
}

export interface GetProjj {
  id: string
  imageUrl: string
  name: string
  targetAmount: number
  description: string
  projectStatus: string
  startDate: string
  endDate: string
  managerId: string
  createdDate: string
  modifiedDate: string
}

