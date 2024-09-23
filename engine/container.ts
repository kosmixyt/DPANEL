import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain";
import { AppDataSource } from "..";


@Entity()
export class Container {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name!: string;
  @Column()
  bindedPorts!: string;

  save() {
    AppDataSource.manager.save(this);
  }
  Ports(): number[] {
    return this.bindedPorts.split(",").map((v) => parseInt(v));
  }
  static async CreateContainer(name: string, ports: number[]) {
    const container = new Container();
    container.name = name;
    container.bindedPorts = ports.join(",");
    await container.save();
  }

  buildNginxConfig(): string {
    return "";
  }
}
