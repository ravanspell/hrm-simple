import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Scope } from './scope.entity';
import { User } from './user.entity';
import { Organization } from '@/entities/organization.entity';
import { ROLE_TABLE } from '@/constants/dbTables';

@Entity(ROLE_TABLE)
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Scope, (scope) => scope.roles)
  @JoinTable()
  scopes: Scope[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToOne(() => Organization, (organization) => organization.roles, {
    onDelete: 'CASCADE',
  })
  organization: Organization;
}
