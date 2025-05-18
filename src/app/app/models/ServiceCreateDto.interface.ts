export interface ServiceCreateDTO {
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  isactive: boolean;
  servicegroupid: number;
  subjecttypeid: number;
}