export interface IprojectDonate {
    statusCode: number
    isSucceeded: boolean
    message: string
    errors: string
    meta: any
    data: Data[]
  }
  
  export interface Data {
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
  