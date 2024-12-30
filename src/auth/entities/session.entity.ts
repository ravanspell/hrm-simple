import { ISession } from "connect-typeorm";
import { SESSION_TABLE } from "src/constants/dbTables";
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity(SESSION_TABLE)
export class Session implements ISession {
    @Index()
    @Column("bigint")
    public expiredAt = Date.now();

    @PrimaryColumn("varchar", { length: 255 })
    public id = "";

    @Column("text")
    public json = "";

    @DeleteDateColumn()
    public destroyedAt?: Date;
}