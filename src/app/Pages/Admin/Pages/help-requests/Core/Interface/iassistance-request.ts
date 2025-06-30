
export interface IAssistanceRequest {
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
  data: Daum[]
}

export interface Daum {
  id: string;
  beneficiaryId: string;
  requestDetails: any;
  inKindDonationId: string;
  requestStatus: number;
  createdDate: string;
  modifiedDate: string;

  // ========= التبرع العيني ========== 
  name?: string;
  description?: string;
  itemType?: number;
  donationStatus?: number;
  quantity?: number;
  imageUrl?: string;
  imageUrls?: string[];
  donorId?: string;
  projectId?: string;
  isAllocated?: boolean;
}
