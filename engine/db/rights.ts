import { Column, Entity, OneToMany } from "typeorm";
import { DbUser } from "./user";
import { Database } from "./db";

@Entity()
export class DbPermission {
  id!: number;
  @OneToMany(() => DbUser, (dbuser) => dbuser.permissions)
  user!: DbUser;
  @OneToMany(() => Database, (db) => db.permissions)
  dbs!: Database[];
  @Column()
  perms!: string;
  setPerms(perms: string[]) {
    this.perms = perms.join(",");
  }
}

const perms = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "DROP",
  "INDEX",
  "ALTER",
  "CREATE TEMPORARY TABLES",
  "LOCK TABLES",
  "CREATE VIEW",
  "SHOW VIEW",
  "CREATE ROUTINE",
  "ALTER ROUTINE",
  "EXECUTE",
  "CREATE USER",
  "EVENT",
  "TRIGGER",
];
