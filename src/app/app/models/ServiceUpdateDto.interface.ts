import { ServiceCreateDTO } from "./ServiceCreateDto.interface";
export interface ServiceUpdateDTO extends ServiceCreateDTO {
  serviceid: number;
}