import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class EmailController {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => EmailAccount, (acc) => acc.controller)
  accounts!: EmailAccount[];
}
@Entity()
export class EmailAccount {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @OneToMany(() => EmailController, (controller) => controller.accounts)
  controller!: EmailController;
}
