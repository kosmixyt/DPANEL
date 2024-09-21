import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DbPermission } from "./rights";

@Entity()
export class DbUser {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name!: string;
  @Column()
  password!: string;
  @ManyToOne(() => DbPermission, (perm) => perm.user)
  permissions!: DbPermission[];
}
