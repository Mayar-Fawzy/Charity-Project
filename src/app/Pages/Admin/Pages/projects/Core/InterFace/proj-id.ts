
export interface ProjId {
  statusCode: number;
  isSucceeded: boolean;
  message: string;
  errors: string;
  meta: null;
  data: ProjectData;
}

export interface ProjectData {
  id: string;
  imageUrl: string;
  name: string;
  targetAmount: number;
  description: string;
  projectStatus: string;
  startDate: string;
  endDate: string;
  managerId: string;
  createdDate: string;
  modifiedDate: string;
}