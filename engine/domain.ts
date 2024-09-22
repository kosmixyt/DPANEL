import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";
import { Container } from "./container";
import { SSL } from "./ssl";
import { EmailController } from "./mail/email";

@Entity()
export class Domain {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name!: string;
  @OneToMany(() => Host, (host) => host.domains, { nullable: true })
  nginxConfig!: Host;
  @OneToMany(() => SSL, (ssl) => ssl.domains, { nullable: true })
  ssl!: SSL;
  @Column()
  emailDisabled!: boolean;
  @OneToOne(() => EmailController, (controller) => controller.Domain)
  emailController!: EmailController;
  getMailController() {
    if (this.emailDisabled) {
      throw new Error("Email is disabled for this domain");
    }
    return this.emailController;
  }
  getController(): Host {
    return this.nginxConfig;
  }
}
