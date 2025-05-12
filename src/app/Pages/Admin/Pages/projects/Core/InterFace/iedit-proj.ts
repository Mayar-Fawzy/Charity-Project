export interface IEditProj {
     id: string; 
  image?: File | null; 
  imageUrl?: string; 
  name: string; 
  targetAmount: number; 
  description: string; 
  projectStatus: string; // Project status (e.g., "Ongoing")
  startDate: string; 
  endDate: string; 
  managerId: string; 
  createdDate: string;
}
