import { Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class EmailController{
    @PrimaryGeneratedColumn('increment')
    id! : number
}