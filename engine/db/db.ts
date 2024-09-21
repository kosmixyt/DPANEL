import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DbPermission } from "./rights";

@Entity()
export class Database {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  name!: string;
  @ManyToOne(() => DbPermission, (perm) => perm.dbs)
  permissions!: DbPermission[];
}
