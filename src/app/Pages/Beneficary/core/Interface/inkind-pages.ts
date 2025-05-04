
  export interface InkindPages {
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
    data: InkindData[]
  }
  
  export interface InkindData {
    id: string
    name: string
    itemType: number
    donationStatus: number
    description: string
    quantity: number
    imageUrls: any[]
    isAllocated: boolean
    donorId: string
    projectId: any
    createdDate: string
    modifiedDate: string
  }
  