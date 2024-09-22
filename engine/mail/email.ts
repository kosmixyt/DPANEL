import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "../domain";
import dns from "dns";
import { AppDataSource } from "../..";

@Entity()
export class EmailController {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => EmailAccount, (acc) => acc.controller)
  accounts!: EmailAccount[];
  @OneToOne(() => Domain, (domain) => domain.emailController)
  Domain!: Domain;
  @Column()
  Inited!: boolean;

  async Init() {}
}
@Entity()
export class EmailAccount {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @OneToMany(() => EmailController, (controller) => controller.accounts)
  controller!: EmailController;
  @Column()
  name!: string;
  @Column()
  alias!: string[];

  // multi domain alias not supported
  static async CreateMail(name: string, alias: string[], controller: EmailController) {
    for (const a of alias) {
      if (!a.endsWith(controller.Domain.name)) {
        throw new Error("Alias must be in the same domain");
      }
    }
    const account = new EmailAccount();
    account.name = name;
    account.alias = alias;
    account.controller = controller;
    await account.save();
    controller.accounts.push(account);
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
}
